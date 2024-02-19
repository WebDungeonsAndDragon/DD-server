const { Server } = require("socket.io");

const express = require("express");
const router = express.Router();

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

io.listen(4000);

module.exports = router;
