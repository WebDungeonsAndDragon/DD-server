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
  socket.on("next-turn", (currentPlayerAction, currentPlayerTurn) => {
    //TODO Expecting method to tell player action to chatGPT
      //most likely involved with getting new prompt

    //TODO Expecting new prompt to store data from chatGPT
    const newPrompt = "test prompt";

    //TODO Create method to update player turn for nextPlayer
    currentPlayerTurn = nextPlayerTurn();

    socket.emit("next-turn-success", currentPlayerTurn, newPrompt);
  });

  //Function for server to frontend communication for End game
  socket.on("end-game", (prepareEndGame) => {
    if (prepareEndGame) {
      //TODO Expecting method for generating final prompt
      const finalPrompt = "test final prompt";


      socket.emit("end-game-success", finalPrompt);
    }
    else {
      const message = "Game ending failed"
      socket.emit("end-game-failure", message);
    }
  });
});

io.listen(4000);

module.exports = router;
