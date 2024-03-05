const express = require("express");
const router = express.Router();
const axios = require("axios").default;
const EDEN_AI_API_KEY = process?.env?.EDEN_AI_API_KEY;

const options = {
  method: "POST",
  url: "https://api.edenai.run/v2/image/generation",
  headers: {
    authorization: `Bearer ${EDEN_AI_API_KEY}`,
  },
  data: {
    providers: "openai",
    text: "a red flying balloon.",
    resolution: "256x256",
    fallback_providers: "",
  },
};

router.get("/", (req, res) => {
  axios
    .request(options)
    .then((response) => {
      console.log(response.data);
      res.send(response.data.openai.items[0].image_resource_url);
    })
    .catch((error) => {
      console.error(error);
    });
});

// module.exports = router;

//learn how to call edenai,
// Assuming EdenAI has a Node SDK, which might not be the case
/*const EdenAI = require("@edenai/ai-sdk");

const edenAI = new EdenAI('YOUR_EDEN_AI_API_KEY');

router.post('/call-eden-ai', async (req, res) => {
    try {
        // Example: calling a specific AI service provided by Eden AI
        // Replace 'specific_ai_service' with the actual service you want to use
        // and adjust parameters as necessary
        const result = await edenAI.specific_ai_service({
            parameters_specific_to_service
        });
        
        res.json(result);
    } catch (error) {
        console.error("Error calling Eden AI:", error);
        res.status(500).send("Failed to call Eden AI");
    }
});


*/

module.exports = router;
