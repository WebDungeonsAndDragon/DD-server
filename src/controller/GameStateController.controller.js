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

  socket.on("join", ({ name, room }, callback) => {
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
    });
  });

  function endRound(roomId) {
    rooms[roomId].updateRoundNumber();
    socket.emit("end-round", {
      roundNumber: rooms[roomId].currentRoundNumber,
    });
  }

  // Server
  socket.on("leave-game", ({ playerThatLeft, roomId }) => {
    rooms[roomId].removePlayer(playerThatLeft);
    console.log(playerThatLeft + " has left.");
    // playerId, not playerName
  });

  socket.on("startGame", ({ numRounds, roomId, players }, callback) => {
    // call open AI function to get the prompt
    rooms[roomId].startGame(numRounds, players);
    const prompt = "blank";
    // let currentPlayerTurn = rooms[roomId].players[0];
    // let roundNumber = 0;
    socket.emit("startGameSuccess", {
      prompt: prompt,
      currentPlayerTurn: rooms[roomId].currentPlayerTurn,
      roundNumber: rooms[roomId].currentRoundNumber,
    });
  });
});

io.listen(8000);

module.exports = router;
