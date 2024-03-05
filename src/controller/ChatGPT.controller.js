const { OpenAI } = require("openai");
const express = require("express");
const router = express.Router();

const CHATGPT_API_KEY = process?.env?.CHATGPT_API_KEY;

const openai = new OpenAI({
  apiKey: CHATGPT_API_KEY,
});
// const completion = openai.ChatCompletion.create(
//   (model = "gpt-3.5-turbo"),
//   (messages = [
//     { role: "system", content: "You are a helpful assistant." },
//     {
//       role: "user",
//       content: "What are some famous astronomical observatories?",
//     },
//   ])
// );

module.exports = router;
