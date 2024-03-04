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
  socket.on("next-turn", ({currentPlayerAction, roomId}) => {
    const room = rooms[roomId];

    //call OpenAI function to get the Prompt
    const newPrompt = "test prompt";

    //TODO Create method to update player turn for nextPlayer
    room.updateCurrentPlayerTurn();

    socket.emit("next-turn-success", {currentPlayerTurn: room.currentPlayerTurn, prompt: newPrompt});
  });

  //Function for server to frontend communication for End game
  socket.on("end-game", ({endGameReason, roomId}) => {
    const room = rooms[roomId];
    //pass endGameReason into chatGPT for final prompt specifics
    //call OpenAI Function to get the prompt
    const finalPrompt = "test final prompt";

    room.endGame();

    socket.emit("end-game-success", {prompt: finalPrompt});
  });
});

io.listen(4000);

module.exports = router;
