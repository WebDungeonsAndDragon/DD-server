const { OpenAI } = require("openai");

const completion = openai.ChatCompletion.create(
  (model = "gpt-3.5-turbo"),
  (messages = [
    { role: "system", content: "You are a helpful assistant." },
    {
      role: "user",
      content: "What are some famous astronomical observatories?",
    },
  ])
);
