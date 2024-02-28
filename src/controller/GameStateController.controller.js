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

  //Function for server to frontend communication for next turn
  socket.on("next-turn", ({currentPlayerAction, currentPlayerTurn}) => {
    //TODO Expecting method to tell player action to chatGPT
      //most likely involved with getting new prompt

    //TODO Expecting new prompt to store data from chatGPT
    const newPrompt = "test prompt";

    //TODO Create method to update player turn for nextPlayer
    currentPlayerTurn = nextPlayerTurn();

    socket.emit("next-turn-success", {currentPlayerTurn, newPrompt});
  });

  //Function for server to frontend communication for End game
  socket.on("end-game", ({prepareEndGame}) => {
    //if prepare endgame is true
    if (prepareEndGame) {
      //TODO Expecting method for generating final prompt
      const finalPrompt = "test final prompt";

      socket.emit("end-game-success", {finalPrompt});
    }
  });
});

io.listen(4000);

module.exports = router;
