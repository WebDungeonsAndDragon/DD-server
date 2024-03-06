const { OpenAI } = require("openai");
const express = require("express");
const router = express.Router();

const rooms = require("../utils/rooms");

const openai = new OpenAI({
    apiKey: "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",
});

/**
 * Helper function to fetch and return data from ChatGPT
 * @param {string} text The prompt that is used to ask ChatGPT something.
 * @returns The JSON object that contains the response from ChatGPT.
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
    "start-game":
        'Create a scenario for a team of 4 players - player 1 is a fighter, player 2 is a mage, player 3 is a cleric, and player 4 is a thief. Only introduce the challenge, do not start the game yet. The output should be in JSON format. The format should be {"introduction": string}',
    "start-round": (roundNumber, firstPlayerRole) =>
        rooms.context +
        `Start round ${roundNumber} of the game. The entire game should last 3 rounds with each round consisting of 4 turns (1 for each player). The ${firstPlayerRole} needs to do something. Give the ${firstPlayerRole} a set of 4 options to choose from. The output should in JSON format. The format should be {"newPrompt": string, "options": string[]}.`,
    "next-turn": (currentPlayerRole, optionChosen, nextPlayerRole) =>
        rooms.context +
        `The ${currentPlayerRole} chooses to do this: ${optionChosen}. With this information, ask the ${nextPlayerRole} to do something from a set of 4 options. Make sure to incorporate what the ${currentPlayerRole} does as well. The output should be in JSON format. The format should be {"newPrompt": string, "options": string[]}.`,
    "end-round": (lastPlayerRole, optionChosen) =>
        rooms.context +
        `The ${lastPlayerRole} chooses to do this: ${optionChosen}. With this information, end the round. The output should be in JSON format. The format should be {"endRound": string}.`,
    "end-game":
        rooms.context +
        'End the game. Flip a coin to choose whether the party wins or loses. The output should be in JSON format. The format should be {"endGame": string}',
};

/**
 * Helper function to add text to the context.
 * @param {string} strToAdd The text to add to the context variable of the room.
 */
async function addToContext(strToAdd) {
    rooms.context += strToAdd;
}

/**
 * Gives the start-game prompt to ChatGPT.
 * @returns {string} The introduction text for the challenge.
 */
async function startGameGPT() {
    const startGameText = await helper(prompts["start-game"]);

    const resp = await startGameText;
    addToContext(`Story: ${resp.introduction}\n`);
    return resp.introduction;
}

/**
 * Gives the start-round prompt to ChatGPT.
 * Use when starting each round AND also giving player 1 options.
 * @param {number} roundNumber The round to start.
 * @param {string} firstPlayerRole The role of the first player/host. Ex: Fighter, Mage, etc.
 * @returns {string[]} A list of strings including the newPrompt for player 1, and their options.
 */
async function startRoundGPT(roundNumber, firstPlayerRole) {
    const startRoundText = await helper(
        prompts["start-round"](roundNumber, firstPlayerRole)
    );

    const resp = await startRoundText;
    return [
        resp.newPrompt,
        resp.options[0],
        resp.options[1],
        resp.options[2],
        resp.options[3],
    ];
}

/**
 * Gives the next-turn prompt to ChatGPT.
 * Use when starting the next turn AND giving the next player options.
 * @param {string} currentPlayerRole The player that just played last turn. Ex: Fighter, Mage, etc.
 * @param {string} optionChosen The entire option that the last player chose.
 * @param {string} nextPlayerRole The next player that needs to play now and is given a set of options. Ex: Fighter, Mage, etc.
 * @returns {string[]} A list of strings including the newPrompt for the player, and their options.
 */
async function nextTurnGPT(currentPlayerRole, optionChosen, nextPlayerRole) {
    const nextTurnText = await helper(
        prompts["next-turn"](currentPlayerRole, optionChosen, nextPlayerRole)
    );

    const resp = await nextTurnText;
    addToContext(
        `The ${currentPlayerRole} chooses to do this: ${optionChosen}.\n`
    );
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
 * @param {string} lastPlayerRole The role of the last player. Ex: Fighter, Mage, etc.
 * @param {string} optionChosen The entire option that the last player chose.
 * @returns The text that concludes the round.
 */
async function endRound(lastPlayerRole, optionChosen) {
    const endRoundText = await helper(
        prompts["end-round"](lastPlayerRole, optionChosen)
    );

    const resp = await endRoundText;
    addToContext(
        `The ${lastPlayerRole} chooses to do this: ${optionChosen}. The round has ended: ${resp.endRound}`
    );
    return resp.endRound;
}

/**
 * Gives the end-game prompt to ChatGPT.
 * @returns The text that concludes the game
 */
async function endGame() {
    const endGameText = await helper(prompts["end-game"]);

    const resp = await endGameText;
    addToContext(`The game has ended: ${resp.endGame}`);
    return resp.endGame;
}

// TESTING

// router.get("/", async (req, res) => {
//     // put function in here
//     await startGameGPT().then((response) => {
//         console.log(response);
//     });

//     await startRoundGPT("1", "Fighter").then((response) => {
//         console.log(response);
//     });

//     await nextTurnGPT("Fighter", "Mage", "2").then((response) => {
//         console.log(response);
//     });
// });

module.exports = router;
