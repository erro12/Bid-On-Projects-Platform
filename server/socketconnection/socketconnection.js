import { uploadProjectPDF } from "../config/multerconfig";
import chatModel from "../models/chat";
import { newNotification } from "../functions/functions";
import notificationModel from "../models/notification";
import userModal from "../models/user";

const getChat = async roomId => {
  if (!roomId) return [];
  const result = await chatModel.findOne({ roomId });
  console.log("found some messages, ", result);
  if (result) return result.messages;
  return [];
};

const saveChat = async (messages, code, uid, employer, _jid, _pid, online) => {
  console.log("code for saving, ", code);
  console.log("messages to save, ", messages);
  if (!code) return;
  try {
    let _ids = code.split("_");
    let unread_messages = false;
    const result = await chatModel.findOne({ roomId: code }, { messages: 1 });
    if (result) {
      console.log("updating old chat");
      await chatModel.update({ roomId: code }, { messages });
      if (messages.length > result.messages) {
        unread_messages = true;
      }
    } else {
      console.log("saving new chat");

      const chatData = new chatModel({
        roomId: code,
        messages,
        employer: _ids[0],
        student: _ids[1]
      });
      chatData.save();
      if (messages.length > 0) unread_messages = true;
    }
    console.log("chat saved successfully!");
    console.log("employer or not, ", employer);
    console.log("_ids here, ", _ids);
    console.log("online, online id 0, ", online, online[_ids[0]]);

    // if (unread_messages) {
    if (true) {
      if (!employer) {
        if (!online[_ids[0]]) {
          console.log("creating notification for employer");
          newNotification(
            "new messages",
            "chat",
            _jid,
            _pid,
            _ids[1],
            _ids[0],
            false,
            false,
            true
          );
        }
      } else {
        if (!online[_ids[1]]) {
          console.log("creating notification for student");
          newNotification(
            "new messages",
            "chat",
            _jid,
            _pid,
            _ids[1],
            _ids[0],
            true,
            true,
            false
          );
        }
      }
    }
  } catch (err) {
    console.log("error occured, ", err);
  }
};

let returnSocket = (io, req, res) => {
  let dict = {};
  let online = {};
  io.on("connection", socket => {
    console.log("one user connected");
    // res.send({code:200, msg:"Chat room loaded"})
    socket.emit("readyForUpdates");

    socket.on("beginUpdates", data => {
      if (!socket.intervalInstance) {
        console.log("assigning uid to socket for updates, ", data);
        socket.uid = data.uid;
        socket.employer = data.employer;
        console.log("socket data from header", socket.uid, socket.employer);

        socket.intervalInstance = setInterval(async function() {
          // console.log("in interval, ", socket.uid);
          if (socket.uid) {
            const nfCount = socket.employer
              ? await notificationModel.countDocuments({
                  employer: socket.uid,
                  empRead: false
                })
              : await notificationModel.countDocuments({
                  student: socket.uid,
                  stdRead: false
                });

            const userData = await userModal.findById(socket.uid, {
              blocked: 1
            });

            // console.log("inside socket interval, ", nfCount, userData);
            socket.emit("updates", {
              nfCount: nfCount,
              blocked: userData.blocked,
              gettingUpdates: true
            });
          }
        }, 2000);

        //emit emp/std is offline now
      }
    });

    socket.on("createRoomForTwo", data => {
      console.log("creating room for viz, ", data.code);
      socket.join(data.code);
      socket.code = data.code;
      const i1 = data.employer ? 0 : 1;
      const i2 = data.employer ? 1 : 0;
      online[socket.code.split("_")[i1]] = true;
      if (!online[socket.code.split("_")[i2]]) {
        online[socket.code.split("_")[i2]] = false;
      }
      socket.uid = socket.code.split("_")[i1];
      socket.employer = data.employer;
      socket._jid = data._jid;
      socket._pid = data._pid;
      console.log(
        "socket code",
        socket.code,
        socket.uid,
        socket._jid,
        socket._pid,
        socket.employer
      );
      console.log("online, ", online);
      console.log("dict, ", dict);

      //emit emp/std is offline now
    });
    socket.on("load_messages", async data => {
      console.log("load msg, ", data);
      // io.sockets.emit("get_chat", ['aaaaa', 'dddddd', 'wwwwwww', 'ssssssss']);
      let messages = dict[data.code]
        ? dict[data.code]
        : await getChat(data.code);
      dict[data.code] = messages;
      console.log("about to load stuff, ", messages);
      //io includes sender while socket doesn't while sending message to members...
      io.in(data.code).emit("get_chat", messages);
      // socket.to(data.code).emit("get_chat", messages);
      // io.to(`${socketId}`).emit();
    });

    socket.on("new_message", async data => {
      console.log("new msg, ", data);

      if (!socket.code) {
        socket.code = data.code;
        const i1 = data.employer ? 0 : 1;
        const i2 = data.employer ? 1 : 0;
        online[socket.code.split("_")[i1]] = true;
        if (!online[socket.code.split("_")[i2]]) {
          online[socket.code.split("_")[i2]] = false;
        }
        socket.uid = socket.code.split("_")[i1];
        socket.employer = data.employer;
        socket._jid = data._jid;
        socket._pid = data._pid;
      }

      let messages = dict[data.code]
        ? dict[data.code]
        : await getChat(data.code);
      messages.push({ msg: data.msg, employer: data.employer, pdf: data.pdf });
      dict[data.code] = messages;

      console.log(
        "data.employer inside new message listener, ",
        data.employer,
        socket.employer
      );
      saveChat(
        dict[socket.code],
        socket.code,
        socket.uid,
        data.employer,
        socket._jid,
        socket._pid,
        online
      );
      console.log("sending messages as new, ", messages);
      // socket.to(data.code).emit('new_message', messages);
      io.in(data.code).emit("new_message", messages);
      // io.sockets.emit('new_message', data.msg);
    });

    socket.on("pdf", data => {
      console.log("new file, ", data);

      let messages = dict[data.code];

      messages.push("file can be uploaded");

      console.log("employer upload project pdf");

      dict[data.code] = messages;
      saveChat(
        dict[socket.code],
        socket.code,
        socket.uid,
        socket.employer,
        socket._jid,
        socket._pid,
        online
      );
      // // socket.to(data.code).emit('new_message', messages);
      io.in(data.code).emit("new_message", messages);
      // io.sockets.emit('new_message', data.msg);
    });

    socket.on("exit_room", () => {
      console.log("exiting room with id", socket.code);

      online[socket.uid] = false;
      //emit emp/std is offline now
      socket.leave(socket.code);
    });

    socket.on("disconnect", () => {
      console.log("disconnecting socket");
      if (socket.intervalInstance) {
        clearInterval(socket.intervalInstance);
      }

      online[socket.uid] = false;
      //emit emp/std is offline now
      saveChat(
        dict[socket.code],
        socket.code,
        socket.uid,
        socket.employer,
        socket._jid,
        socket._pid,
        online
      );
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  });
};
module.exports = returnSocket;
