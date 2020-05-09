//imports
import express from "express";
import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import { PORT, clientPath } from "./config/keys";
import { mongoConnect } from "./config/mongo";
import cors from "cors";
import socket from "socket.io";
import chatModel from "./models/chat";



let app = express();
const server = http.createServer(app);
const io = socket(server);

//routes
const employerRouter = require("./routes/employer")();
const studentRouter = require("./routes/student")();
const userRouter = require("./routes/user")();
const adminRouter = require("./routes/admin")();

//middlewares
app.use(
  cors({
    origin: clientPath,
    credentials: true
  })
);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser("cookiesecret"));
app.use(express.static(path.join(__dirname, "public")));
mongoConnect();
require("./socketconnection/socketconnection")(io);

//routes middlewares

app.use("/employer", employerRouter);
app.use("/student", studentRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);

module.exports = app;

app.get("/", (req, res) => {
  res.send("hello");
});

let dict = {};

io.on("connection", socket => {});

//server
try {
  server.listen(PORT, () => console.log(`server running on port ${PORT}`));
} catch (err) {
  console.log(err);
}
