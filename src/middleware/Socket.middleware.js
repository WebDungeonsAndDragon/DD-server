const server = require("./Server.middleware");

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173/",
    methods: ["GET", "POST"],
  },
});

module.exports = io;
