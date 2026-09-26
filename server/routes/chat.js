const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();


// Wait function
const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};


// Gemini request function
const askGemini = async (model, prompt) => {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },

    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();

  return {
    response,
    data,
  };
};


// AI Travel Chat
router.post("/", auth, async (req, res) => {
  try {

    const {
      message,
      tripContext,
    } = req.body;


    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a question.",
      });
    }


    const context = tripContext
      ? `
Current user's trip information:

Destination: ${tripContext.destination || "Not provided"}
Start Date: ${tripContext.startDate || "Not provided"}
End Date: ${tripContext.endDate || "Not provided"}
Budget: ${tripContext.budget || "Not provided"} PKR
Travelers: ${tripContext.travelers || "Not provided"}
`
      : `
The user has not selected a trip yet.
`;


    const prompt = `
You are Smart Travel Planner's AI Travel Assistant.

${context}

User's question:
${message}

Instructions:

1. Answer the user's question directly.
2. Be friendly, practical and helpful.
3. Use the user's trip information when relevant.
4. For budget questions, give estimated ranges.
5. For activities, suggest relevant activities.
6. For transportation, explain practical options.
7. For food, suggest local food.
8. For hotels, suggest suitable accommodation types and estimated prices.
9. If the question is unrelated to travel, politely explain that you are mainly a travel assistant.
10. Never claim that you personally booked anything.
11. Never expose API keys or private information.
12. Keep the answer easy to read.
13. Do not use Markdown tables.
14. Do not use #, ##, ###, ** or *.

Give a useful answer.
`;


    // Current valid Gemini models
    const models = [
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.6-flash",
    ];


    let lastError =
      "Gemini request failed.";


    // Try each model
    for (const model of models) {

      console.log(
        `Trying Gemini model: ${model}`
      );


      // Retry same model up to 3 times
      for (let attempt = 1; attempt <= 3; attempt++) {

        try {

          console.log(
            `Attempt ${attempt}/3 for ${model}`
          );


          const {
            response,
            data,
          } = await askGemini(
            model,
            prompt
          );


          // Successful response
          if (response.ok) {

            const answer =
              data.candidates?.[0]?.content?.parts
                ?.map((part) => part.text || "")
                .join("") || "";


            if (answer) {

              console.log(
                `Gemini SUCCESS: ${model}`
              );


              return res.json({
                answer,
                model,
              });
            }
          }


          lastError =
            data.error?.message ||
            `Gemini ${model} failed`;


          console.log(
            `Gemini error:`,
            lastError
          );


          // Temporary overload / rate limit
          if (
            response.status === 503 ||
            response.status === 429 ||
            response.status === 500 ||
            response.status === 504
          ) {

            // Wait progressively:
            // attempt 1 -> 2 sec
            // attempt 2 -> 4 sec
            // attempt 3 -> 8 sec

            const delay =
              2000 * Math.pow(
                2,
                attempt - 1
              );


            console.log(
              `Waiting ${delay}ms before retry...`
            );


            await wait(delay);

            continue;
          }


          // Other errors are not temporary
          return res.status(
            response.status
          ).json({
            message: lastError,
          });

        } catch (error) {

          lastError =
            error.message;


          console.log(
            `Request error:`,
            error.message
          );


          // Wait before retry
          const delay =
            2000 * Math.pow(
              2,
              attempt - 1
            );


          await wait(delay);
        }
      }


      console.log(
        `Moving to next Gemini model...`
      );
    }


    // All models failed
    return res.status(503).json({
      message:
        "Gemini is temporarily overloaded. Please try again in a minute.",
      details: lastError,
    });


  } catch (err) {

    console.error(
      "Chat error:",
      err
    );


    res.status(500).json({
      message: err.message,
    });
  }
});


module.exports = router;