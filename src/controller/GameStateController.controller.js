const { Server } = require("socket.io");

const express = require("express");
const router = express.Router();

const Room = require("../model/Room.model");
const Player = require("../model/Player.model");

const rooms = {};

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("new user connected!");

  socket.on("createRoom", ({ roomId, hostName }) => {
    rooms[roomId] = new Room(roomId, new Player(socket.id, hostName));
  });

  // join room method - takes in roomCode and playerId
  //  returns playerList
  socket.on("joinRoom", ({ roomId, player }, callback) => {
    // const { error, user } = addUser({ id: socket.id, name, room });
    // if (error) return callback(error);
    // socket.emit("message", {
    //   user: "admin",
    //   text: `${user.name},
    // welcome to room ${user.room}.`,
    // });
    const newPlayer = new Player(player.id, player.name, null);
    rooms[roomId].addPlayer(newPlayer);
    socket.emit("joinRoomSuccess", {
      players: rooms[roomId].players,
    })
  });

  socket.on("startGame", ({numRounds, roomId, players}, callback) => {
    // call open AI function to get the prompt
    rooms[roomId].startGame(numRounds, players);
    const prompt = "blank";
    // let currentPlayerTurn = rooms[roomId].players[0];
    // let roundNumber = 0;
    socket.emit("startGameSuccess", {
      prompt: prompt,
      currentPlayerTurn: rooms[roomId].currentPlayerTurn,
      roundNumber: rooms[roomId].currentRoundNumber,
    })
  })
});

io.listen(4000);

module.exports = router;
