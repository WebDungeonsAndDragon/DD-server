const env = require("dotenv");
env.config();

// import libraries
const express = require("express");
const cors = require("cors");

const app = express();

// allow requests from any origin (so our web application can easily communicate with our server)
// const app = require("./middleware/ExpressApp.middleware");
// const server = require("./middleware/Server.middleware");

// handle JSON requests and responses nicely
app.use(express.json());

// controllers
// const chatgptController = require("./controller/ChatGPT.controller");
const imageGenerationController = require("./controller/ImageAPI.controller");
const gameStateController = require("./controller/GameStateController.controller");

// Creating an endpoint for a particular resource and link it to a controller
// app.use("/api/v1/ChatGPT", chatgptController);
app.use("/api/v1/ImageGeneration", imageGenerationController);

// start the application so that it listens at port 8081
const port = process?.env?.PORT || 8081;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
