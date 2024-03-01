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
  });

  // NEXT TURN 

  // Client 
  // socket.emit("next-turn", ({currentPlayerAction, currentPlayer, roomId});

  // Server 
  socket.on("next-turn", ({currentPlayerAction, currentPlayer, roomId}) => {
    // socket.emit("next-turn-to-client", currentPlayerTurn, newPrompt); 
    // increase player index 

  });

  // Client 
  // socket.on("next-turn-to-client", (currentPlayerTurn, newPrompt) => {
  // 
  // });

  // END ROUND

  function endRound(roomId) {
    rooms[roomId].updateRoundNumber();
    socket.emit("end-round", {
      roundNumber: rooms[roomId].currentRoundNumber,
    });
  }


  // Client
  socket.on("end-round-message", ({roundNumber}) => {
    // display roundnumber
    // socket.emit success? 
  });

  // Display roundNumber? need roomId? add roundNumber to room?

  // LEAVE GAME

  // Client
  // socket.emit("leave-game", {playerId, roomId});

  // Server
  socket.on("leave-game", ({playerThatLeft, roomId}) => {
    rooms[roomId].removePlayer(playerThatLeft)
    console.log(playerThatLeft + " has left.")
    // playerId, not playerName
  });

  
  
});

io.listen(8000);

module.exports = router;
