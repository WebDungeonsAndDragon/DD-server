const { Server } = require("socket.io");

const express = require("express");
const router = express.Router();

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("new user connected!");

  socket.on("example", ({ name, room }, callback) => {
    // const { error, user } = addUser({ id: socket.id, name, room });
    // if (error) return callback(error);
    // socket.emit("message", {
    //   user: "admin",
    //   text: `${user.name},
    // welcome to room ${user.room}.`,
    // });
  });
});

io.listen(4000);

module.exports = router;
