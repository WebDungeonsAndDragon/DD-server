const { Server } = require("socket.io");

const express = require("express");
const router = express.Router();

const Room = require("../model/Room.model");
const Player = require("../model/Player.model");

const rooms = require("../utils/rooms");
const {
  endGameGPT,
  endRoundGPT,
  startGameGPT,
  nextTurnGPT,
} = require("./ChatGPT.controller");

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("new user connected!");
  socket.on("createRoom", ({ roomId, hostName }) => {
    rooms[roomId] = new Room(roomId, new Player(socket.id, hostName, null));
  });
  socket.on("joinRoom", ({ roomId, playerName }) => {
    const newPlayer = new Player(socket.id, playerName, null);
    socket.join(roomId);
    if (rooms[roomId] === undefined) {
      rooms[roomId] = new Room(roomId, newPlayer);
    } else {
      rooms[roomId].addPlayer(newPlayer);
    }
    socket.to(roomId).emit("joinRoomSuccess", {
      players: rooms[roomId].players,
    });
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

  //Function for server to frontend communication for next turn
  socket.on("next-turn", ({ currentPlayerAction, roomId }) => {
    // const room = rooms[roomId];

    // const newPrompt = "test prompt";
    previousPlayer = rooms[roomId].players[rooms[roomId].currentPlayerTurn];
    const hasStartedNewRound = rooms[roomId].updateCurrentPlayerTurn();
    if (hasStartedNewRound) {
      endRound(roomId);
      endRoundGPT(
        roomId,
        previousPlayer.role,
        currentPlayerAction,
        rooms[roomId].currentRoundNumber,
        rooms[roomId].players[0].role
      ).then((response) => {
        if (rooms[roomId].endGameEarly) {
          endGameHelper(roomId);
        } else {
          socket.to(roomId).emit("end-round-success", {
            currentPlayerTurn: rooms[roomId].players[0].id,
            introduction: response.endRound,
            prompt: response.newPrompt,
            options: response.options,
          });
          socket.emit("end-round-success", {
            currentPlayerTurn: rooms[roomId].players[0].id,
            introduction: response.endRound,
            prompt: response.newPrompt,
            options: response.options,
          });
          rooms[roomId].badDecisions = 0;
        }
      });
      return;
    }

    nextTurnGPT(
      roomId,
      previousPlayer.role,
      currentPlayerAction,
      rooms[roomId].players[rooms[roomId].currentPlayerTurn].role
    ).then((response) => {
      socket.to(roomId).emit("next-turn-success", {
        currentPlayerTurn:
          rooms[roomId].players[rooms[roomId].currentPlayerTurn].id,
        prompt: response,
      });
      socket.emit("next-turn-success", {
        currentPlayerTurn:
          rooms[roomId].players[rooms[roomId].currentPlayerTurn].id,
        prompt: response,
      });
    });
  });

  function endGameHelper(roomId) {
    const room = rooms[roomId];
    endGameGPT(roomId).then((response) => {
      room.endGame();
      socket.to(roomId).emit("end-game-success", response);
      socket.emit("end-game-success", response);
    });
  }

  //Function for server to frontend communication for End game
  socket.on("end-game", ({ endGameReason, roomId }) => {
    endGameHelper(roomId);
    //pass endGameReason into chatGPT for final prompt specifics
    //call OpenAI Function to get the prompt
    // const finalPrompt = "test final prompt";
  });

  socket.on("startGame", ({ numRounds, roomId, roles }) => {
    // update roles of players
    rooms[roomId].startGame(numRounds, roles);
    startGameGPT(
      roomId,
      rooms[roomId].players[rooms[roomId].currentPlayerTurn].role,
      roles
    )
      .then((response) => {
        socket.to(roomId).emit("startGameSuccess", {
          introduction: response.introduction,
          prompt: response.prompt,
          currentPlayerTurn:
            rooms[roomId].players[rooms[roomId].currentPlayerTurn].id,
          roundNumber: rooms[roomId].currentRoundNumber,
          options: response.options,
        });
        socket.emit("startGameSuccess", {
          introduction: response.introduction,
          prompt: response.prompt,
          currentPlayerTurn:
            rooms[roomId].players[rooms[roomId].currentPlayerTurn].id,
          roundNumber: rooms[roomId].currentRoundNumber,
          options: response.options,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  });

  socket.on("removePlayer", ({ roomId }) => {
    if (rooms[roomId]) {
      console.log(roomId);
      rooms[roomId].removePlayer(socket.id);
    }
  });
});

io.listen(8000);

module.exports = router;
