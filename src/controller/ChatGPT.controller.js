const { OpenAI } = require("openai");
const express = require("express");
const router = express.Router();

const rooms = require("../utils/rooms");

const openai = new OpenAI({
    apiKey: "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",
});

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

const prompts = {
    "start-game":
        'Create a scenario for a team of 4 players - player 1 is a fighter, player 2 is a mage, player 3 is a cleric, and player 4 is a thief. Only introduce the challenge, do not start the game yet. The output should be in JSON format. The format should be {"introduction": string}',
    "start-round": (roundNumber, firstPlayerRole) =>
        rooms.context +
        `Start round ${roundNumber} of the game. The entire game should last 3 rounds with each round consisting of 4 turns (1 for each player). The ${firstPlayerRole} needs to do something. Give the ${firstPlayerRole} a set of 4 options to choose from. Make sure to label the options from 1 to 4. The output should in JSON format. The format should be {"newPrompt": string, "options": string[]}.`,
    "next-turn": (currentPlayerRole, nextPlayerRole, optionChosen) =>
        rooms.context +
        `The ${currentPlayerRole} chooses to do this: ${optionChosen}. With this information, ask the ${nextPlayerRole} to do something from a set of 4 options. Make sure to incorporate what the ${currentPlayerRole} does as well. Make sure to label the options from 1 to 4. The output should be in JSON format. The format should be {"newPrompt": string, "options": string[]}.`,
    "end-round": (lastPlayerRole, optionChosen) =>
        `The ${lastPlayerRole} chooses to do this: ${optionChosen}. With this information, end the round. The output should be in JSON format. The format should be {"endRound": string}.`,
};

async function addToContext(strToAdd) {
    rooms.context += strToAdd;
}

async function startGameGPT() {
    const startGameText = await helper(prompts["start-game"]);

    const resp = await startGameText;
    addToContext(resp.introduction + "\n");
    return resp.introduction;
}

async function startRoundGPT(roundNumber, firstPlayerRole) {
    const startRoundText = await helper(
        prompts["start-round"](roundNumber, firstPlayerRole)
    );

    const resp = await startRoundText;
    addToContext(
        resp.newPrompt +
            resp.options[0] +
            resp.options[1] +
            resp.options[2] +
            resp.options[3]
    );
    return [
        resp.newPrompt,
        resp.options[0],
        resp.options[1],
        resp.options[2],
        resp.options[3],
    ];
}

async function nextTurnGPT(currentPlayerRole, nextPlayerRole, optionChosen) {
    const nextTurnText = await helper(
        prompts["next-turn"](currentPlayerRole, nextPlayerRole, optionChosen)
    );

    const resp = await nextTurnText;
    addToContext(
        `${currentPlayerRole} chooses option ${optionChosen}. ` +
            resp.newPrompt +
            resp.options[0] +
            resp.options[1] +
            resp.options[2] +
            resp.options[3]
    );
    return [
        resp.newPrompt,
        resp.options[0],
        resp.options[1],
        resp.options[2],
        resp.options[3],
    ];
}

async function endRound(lastPlayerRole, optionChosen) {
    const endRoundText = await helper(prompts["end-round"]);

    const resp = await endRoundText;
    return resp.endRound;
}

// TO-DO: Not sure how to make the prompt for ending early and what parameters may be required
// function endGame()

router.get("/", async (req, res) => {
    // put function in here
    await startGameGPT().then((response) => {
        console.log(response);
    });

    await startRoundGPT("1", "Fighter").then((response) => {
        console.log(response);
    });

    await nextTurnGPT("Fighter", "Mage", "2").then((response) => {
        console.log(response);
    });

    await nextTurnGPT("Mage");
});

module.exports = router;
