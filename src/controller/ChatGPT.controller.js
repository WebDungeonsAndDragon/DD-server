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
    "start-game": (firstPlayerRole) =>
        rooms.context +
        `Create a scenario for a team of 4 players - player 1 is a fighter, player 2 is a mage, player 3 is a cleric, and player 4 is a thief. Introduce the challenge, then start the first round of the game. The entire game should last 3 rounds with each round consisting of 4 turns (1 for each player). The ${firstPlayerRole} needs to do something. Give the ${firstPlayerRole} a set of 4 options to choose from. The output should in JSON format. The format should be {"introduction": string, "newPrompt": string, "options": string[]}.`,
    "next-turn": (currentPlayerRole, optionChosen, nextPlayerRole) =>
        rooms.context +
        `The ${currentPlayerRole} chooses to do this: ${optionChosen}. With this information, ask the ${nextPlayerRole} to do something from a set of 4 options. Make sure to incorporate what the ${currentPlayerRole} does as well. The output should be in JSON format. The format should be {"newPrompt": string, "options": string[]}.`,
    "end-round": (
        lastPlayerRole,
        optionChosen,
        roundToStart,
        firstPlayerRole
    ) =>
        rooms.context +
        `The ${lastPlayerRole} chooses to do this: ${optionChosen}. With this information, end the round. Start round ${roundToStart} of the game. The entire game should last 3 rounds with each round consisting of 4 turns (1 for each player). The ${firstPlayerRole} needs to do something. Give the ${firstPlayerRole} a set of 4 options to choose from. The output should be in JSON format. The format should be {"endRound": string, "newPrompt": string, "options": string[]}.`,
    "end-game":
        rooms.context +
        `End the game. Choose whether the party wins or loses and explain what happened. The output should be in JSON format. The format should be {"endGame": string}`,
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
 * Use when starting the game once AND round 1 AND also giving player 1 options.
 * @param {string} firstPlayerRole The role of the first player/host. Ex: Fighter, Mage, etc.
 * @returns {string[]} A list of strings including the challenge's introduction, newPrompt for player 1, and their options.
 */
async function startGameGPT(firstPlayerRole) {
    const startGameText = await helper(prompts["start-game"](firstPlayerRole));

    const resp = await startGameText;
    addToContext(`Story: ${resp.introduction}\n`);
    return [
        resp.introduction,
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
 * Use after the last player has played, and to start the next round.
 * @param {string} lastPlayerRole The role of the last player. Ex: Fighter, Mage, etc.
 * @param {string} optionChosen The entire option that the last player chose.
 * @param {number} roundToStart The number of the round that needs to begin after the current one ends.
 * @param {string} firstPlayerRole The role of the first player to play in the NEW round. Ex: Fighter, Mage, etc.
 * @returns {string[]} A list of strings containing the text that concludes the round, the new prompt for the first player in the new round, and their options.
 */
async function endRound(
    lastPlayerRole,
    optionChosen,
    roundToStart,
    firstPlayerRole
) {
    const endRoundText = await helper(
        prompts["end-round"](
            lastPlayerRole,
            optionChosen,
            roundToStart,
            firstPlayerRole
        )
    );

    const resp = await endRoundText;
    addToContext(
        `The ${lastPlayerRole} chooses to do this: ${optionChosen}. The round has ended: ${resp.endRound}`
    );
    return [
        resp.endRound,
        resp.newPrompt,
        resp.options[0],
        resp.options[1],
        resp.options[2],
        resp.options[3],
    ];
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

//     await startGameGPT("Fighter").then((response) => {
//         console.log(response);
//     });

//     await nextTurnGPT("Fighter", "2", "Mage").then((response) => {
//         console.log(response);
//     });
// });

module.exports = router;
