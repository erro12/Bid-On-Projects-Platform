
export const announcemessage = async (io, message, res) => {
  io.emit("MSG_FOR_ALL", message);
  res.send({
    code: 200,
    msg: "Message announced"
  });
};

export const createRoomForTwo = async (socket, roomId) => {
  console.log("creating room for viz, ", roomId);
  socket.join(roomId);
  socket.roomId = roomId;
  console.log("socket code", socket.roomId);
};

let dict = {};

export const load_messages = async (io, roomId) => {
  console.log("load msg, ", roomId);
  // io.sockets.emit("get_chat", ['aaaaa', 'dddddd', 'wwwwwww', 'ssssssss']);
  let messages = await getChat(roomId);
  dict[roomId] = messages;
  console.log("about to load stuff, ", messages);
  //io includes sender while socket doesn't while sending message to members...
  io.in(roomId).emit("get_chat", messages);
  // socket.to(data.code).emit("get_chat", messages);
  // io.to(`${socketId}`).emit();
};

export const new_message = async (io, roomId, msg) => {
  console.log("new msg, ", data);

  let messages = dict[roomId];
  messages.push(msg);
  dict[roomId] = messages;
  // socket.to(data.code).emit('new_message', messages);
  io.in(roomId).emit("new_message", messages);
  // io.sockets.emit('new_message', data.msg);
};

// socket.on("disconnect", () => {
//   saveChat(dict[socket.roomId], socket.roomId);
// });

const saveChat = async (messages, roomId) => {
  console.log("room for saving, ", roomId);
  console.log("messages to save, ", messages);
  try {
    const result = await chatModel.findOne({ roomId });
    if (result) {
      console.log("updating old chat");
      await chatModel.update({ roomId }, { messages });
    } else {
      console.log("saving new chat");
      const chatData = new chatModel({ roomId, messages });
      chatData.save();
    }
    console.log("chat saved successfully!");
  } catch (err) {
    console.log("error occured, ", err);
  }
};

const getChat = async roomId => {
  const result = await chatModel.findOne({ roomId });
  console.log("found some messages, ", result);
  if (result) return result.messages;
  return [];
};


// server.listen(PORT, () => console.log(`server running on port ${PORT}`));