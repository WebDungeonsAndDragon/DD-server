const { OpenAI } = require("openai");
const express = require("express");
const router = express.Router();

const rooms = require("../utils/rooms");

const openai = new OpenAI({
  apiKey: process?.env?.CHATGPT_API_KEY,
});

/**
 * Helper function to fetch and return data from ChatGPT
 * @param {string} text The prompt that is used to ask ChatGPT something.
 * @returns {JSON} The JSON object that contains the response from ChatGPT.
 */
async function helper(text) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: text,
      },
    ],
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
  });

  const response = await JSON.parse(completion.choices[0].message.content);
  return response;
}

/**
 * Contains all possible scenarios in the game with their own prompt texts to ask ChatGPT.
 * Uses the context variable of the room for ChatGPT to remember previous conversations.
 */

const prompts = {
  "start-game": (roomId, firstPlayerRole, roles) =>
    rooms[roomId].context +
    `Create a scenario for a team of ${rooms[roomId].players.length} players. Their roles are ${roles}, in order. Introduce the challenge, then start the first round of the game. The entire game should last 3 rounds with each round consisting of ${rooms[roomId].players.length} turns (1 for each player). The ${firstPlayerRole} needs to do something. Give the ${firstPlayerRole} a set of 4 options to choose from. Include AT LEAST 1 obvious good option and AT LEAST 1 obvious bad option. Each round's enemy/enemies should have strengths and weaknesses specified in the new prompt for player 1. The obvious good/bad option(s) should incorporate these strengths/weaknesses. An option should also include if it is good or bad. Use "|" as a delimiter between the option and whether it is good/bad. An example option would be "Attack the goblins with a brass mace. | Good". The output should in JSON format. The format should be {"introduction": string, "newPrompt": string, "options": string[]}.`,
  "next-turn": (roomId, currentPlayerRole, optionChosen, nextPlayerRole) =>
    rooms[roomId].context +
    `The ${currentPlayerRole} chooses to do this: ${optionChosen}. With this information, ask the ${nextPlayerRole} to do something from a set of 4 options. Make sure to incorporate what the ${currentPlayerRole} does as well. Include AT LEAST 1 obvious good option and AT LEAST 1 obvious bad option. An option should also include if it is good or bad. Use "|" as a delimiter between the option and whether it is good/bad. An example option would be "Attack the goblins with a brass mace. | Good". The output should be in JSON format. The format should be {"newPrompt": string, "options": string[]}.`,
  "end-round": (
    roomId,
    lastPlayerRole,
    optionChosen,
    roundToStart,
    firstPlayerRole
  ) =>
    rooms[roomId].context +
    `The ${lastPlayerRole} chooses to do this: ${optionChosen}. With this information, end the round. Start round ${roundToStart} of the game. Introduce a new enemy/enemies. Explain how the previous enemies were defeated in newPrompt. The entire game should last 3 rounds with each round consisting of ${rooms[roomId].players.length} turns (1 for each player). The ${firstPlayerRole} needs to do something. Give the ${firstPlayerRole} a set of 4 options to choose from. Include AT LEAST 1 obvious good option and AT LEAST 1 obvious bad option. Each round's enemy/enemies should have strengths and weaknesses specified in the new prompt for player 1. The obvious good/bad option(s) should incorporate these strengths/weaknesses. An option should also include if it is good or bad. Use "|" as a delimiter between the option and whether it is good/bad. An example option would be "Attack the goblins with a brass mace. | Good". The output should be in JSON format. The format should be {"endRound": string, "newPrompt": string, "options": string[]}.`,
  "end-game": (roomId) =>
    rooms[roomId].context +
    (rooms[roomId].endGameEarly == false
      ? `End the game. Choose whether the party wins or loses and give a story of how they won/lost based on the context provided. The output should be in JSON format. The format should be {"endGame": string, "story": string}`
      : `End the game. The party loses. endGame should be "lose". Give a story of how the party lost due to too many bad decisions. The output should be in JSON format. The format should be {"endGame": string, "story": string}`),
};

/**
 * Helper function to add text to the context.
 * @param {string} strToAdd The text to add to the context variable of the room.
 */
function addToContext(roomId, strToAdd) {
  rooms[roomId].context += strToAdd;
}

/**
 * Gives the start-game prompt to ChatGPT.
 * @returns {string} The introduction text for the challenge.
 */
async function startGameGPT(roomId, firstPlayerRole) {
  const startGameText = await helper(
    prompts["start-game"](roomId, firstPlayerRole)
  );
  rooms[roomId].badDecisions = 0;

  const resp = await startGameText;
  addToContext(
    roomId,
    `Story: ${resp.introduction}.\n${firstPlayerRole}'s prompt is: ${resp.newPrompt}.\n`
  );
  console.log("Players' length" + rooms[roomId].players.length);
  console.log("Start Game: " + rooms[roomId].badDecisions);
  return {
    introduction: resp.introduction,
    prompt: resp.newPrompt,
    options: [
      resp.options[0],
      resp.options[1],
      resp.options[2],
      resp.options[3],
    ],
  };
}

/**
 * Gives the next-turn prompt to ChatGPT.
 * Use when starting the next turn AND giving the next player options.
 * @param {string} currentPlayerRole The player that just played last turn. Ex: Fighter, Mage, etc.
 * @param {string} optionChosen The entire option that the last player chose.
 * @param {string} nextPlayerRole The next player that needs to play now and is given a set of options. Ex: Fighter, Mage, etc.
 * @returns {string[]} A list of strings including the newPrompt for the player, and their options.
 */
async function nextTurnGPT(
  roomId,
  currentPlayerRole,
  optionChosen,
  nextPlayerRole
) {
  console.log("Start of Next Turn: " + rooms[roomId].badDecisions);
  const nextTurnText = await helper(
    prompts["next-turn"](
      roomId,
      currentPlayerRole,
      optionChosen,
      nextPlayerRole
    )
  );

  const resp = await nextTurnText;
  if (optionChosen.split("|")[1].trim() === "Bad") {
    rooms[roomId].badDecisions++;
  }

  addToContext(
    roomId,
    `The ${currentPlayerRole} chooses to do this: ${optionChosen}.\n${nextPlayerRole}'s prompt is: ${resp.newPrompt}.\n`
  );
  console.log("End of Next Turn: " + rooms[roomId].badDecisions);

  return [
    resp.newPrompt,
    resp.options[0],
    resp.options[1],
    resp.options[2],
    resp.options[3],
  ];
}

/**
 * Gives the end-round prompt to ChatGPT.
 * Use after the last player has played, and to start the next round.
 * @param {string} lastPlayerRole The role of the last player. Ex: Fighter, Mage, etc.
 * @param {string} optionChosen The entire option that the last player chose.
 * @param {number} roundToStart The number of the round that needs to begin after the current one ends.
 * @param {string} firstPlayerRole The role of the first player to play in the NEW round. Ex: Fighter, Mage, etc.
 * @returns {string[]} A list of strings containing the text that concludes the round, the new prompt for the first player in the new round, and their options.
 */
async function endRoundGPT(
  roomId,
  lastPlayerRole,
  optionChosen,
  roundToStart,
  firstPlayerRole
) {
  if (optionChosen.split("|")[1].trim() === "Bad") {
    rooms[roomId].badDecisions++;
  }

  const endRoundText = await helper(
    prompts["end-round"](
      roomId,
      lastPlayerRole,
      optionChosen,
      roundToStart,
      firstPlayerRole
    )
  );
  console.log("Before end round: " + rooms[roomId].badDecisions);

  const resp = await endRoundText;

  addToContext(
    roomId,
    `The ${lastPlayerRole} chooses to do this: ${optionChosen}. The round has ended: ${resp.endRound}. The next round, round ${roundToStart}, has started: ${resp.newPrompt}.`
  );
  rooms[roomId].endGameEarly =
    rooms[roomId].badDecisions >=
    Math.floor(rooms[roomId].players.length / 2) + 1;
  console.log(rooms[roomId].endGameEarly);
  //rooms[roomId].badDecisions = 0;
  console.log("End of round: " + rooms[roomId].badDecisions);
  return resp;
}

/**
 * Gives the end-game prompt to ChatGPT.
 * @returns The text that concludes the game
 */
async function endGameGPT(roomId) {
  const endGameText = await helper(prompts["end-game"](roomId));

  const resp = await endGameText;
  addToContext(roomId, `The game has ended: ${resp.endGame}`);
  console.log(resp);
  return resp;
}

// module.exports = router;
module.exports = {
  startGameGPT,
  nextTurnGPT,
  endGameGPT,
  endRoundGPT,
};
