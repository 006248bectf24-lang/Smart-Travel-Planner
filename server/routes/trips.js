const express = require("express");
const auth = require("../middleware/auth");
const Trip = require("../models/Trip");
const User = require("../models/User");

const router = express.Router();

const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

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

/* =========================
   CREATE TRIP
========================= */

router.post("/", auth, async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      budget,
      travelers,
    } = req.body;

    if (
      !destination ||
      !startDate ||
      !endDate ||
      !budget
    ) {
      return res.status(400).json({
        message: "Please fill all required trip fields.",
      });
    }

    const trip = await Trip.create({
      user: req.userId,
      destination,
      startDate,
      endDate,
      budget,
      travelers: travelers || 1,
    });

    res.status(201).json(trip);
  } catch (err) {
    console.error("Create trip error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   GET ALL USER TRIPS
========================= */

router.get("/", auth, async (req, res) => {
  try {
    const trips = await Trip.find({
      user: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.json(trips);
  } catch (err) {
    console.error("Get trips error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   GET SINGLE TRIP
========================= */

router.get("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found.",
      });
    }

    res.json(trip);
  } catch (err) {
    console.error("Get single trip error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   DELETE TRIP
========================= */

router.delete("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found.",
      });
    }

    res.json({
      message: "Trip deleted successfully.",
    });
  } catch (err) {
    console.error("Delete trip error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   ADD EXPENSE
========================= */

router.post("/:id/expenses", auth, async (req, res) => {
  try {
    const {
      category,
      amount,
      note,
      date,
    } = req.body;

    if (!category || amount === undefined) {
      return res.status(400).json({
        message: "Category and amount are required.",
      });
    }

    const numericAmount = Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        message: "Amount must be greater than 0.",
      });
    }

    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found.",
      });
    }

    trip.expenses.push({
      category,
      amount: numericAmount,
      note: note || "",
      date: date || new Date(),
    });

    await trip.save();

    res.status(201).json({
      message: "Expense added successfully.",
      trip,
    });
  } catch (err) {
    console.error("Add expense error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   DELETE EXPENSE
========================= */

router.delete(
  "/:id/expenses/:expenseId",
  auth,
  async (req, res) => {
    try {
      const trip = await Trip.findOne({
        _id: req.params.id,
        user: req.userId,
      });

      if (!trip) {
        return res.status(404).json({
          message: "Trip not found.",
        });
      }

      const expense = trip.expenses.id(
        req.params.expenseId
      );

      if (!expense) {
        return res.status(404).json({
          message: "Expense not found.",
        });
      }

      expense.deleteOne();

      await trip.save();

      res.json({
        message: "Expense deleted successfully.",
        trip,
      });
    } catch (err) {
      console.error("Delete expense error:", err);

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

/* =========================
   GENERATE AI ITINERARY
========================= */

router.post(
  "/:id/itinerary",
  auth,
  async (req, res) => {
    try {
      const trip = await Trip.findOne({
        _id: req.params.id,
        user: req.userId,
      });

      if (!trip) {
        return res.status(404).json({
          message: "Trip not found.",
        });
      }

      const user = await User.findById(
        req.userId
      );

      const prompt = `
You are an expert travel planner.

Create a detailed personalized travel itinerary.

Traveler name:
${user?.name || "Traveler"}

Destination:
${trip.destination}

Start date:
${trip.startDate}

End date:
${trip.endDate}

Number of travelers:
${trip.travelers}

Total budget:
${trip.budget} (in the local currency of the destination country)

Create a practical day-by-day itinerary.

For every day include:

1. Morning
2. Afternoon
3. Evening
4. Food suggestions
5. Transportation suggestions
6. Estimated daily spending
7. Important travel tips

Keep the total estimated spending within the user's budget where reasonably possible.

Always mention the currency clearly (for example USD, EUR, PKR, JPY, INR) based on the destination country.

Make the itinerary easy to read.

Do not use Markdown tables.
`;

      const models = [
        "gemini-3-flash-preview",
        "gemini-3.6-flash",
        "gemini-3.7-flash",
        "gemini-3.8-flash",
      ];

      let lastError =
        "Gemini request failed.";

      for (const model of models) {
        console.log(
          `Trying Gemini itinerary model: ${model}`
        );

        for (
          let attempt = 1;
          attempt <= 3;
          attempt++
        ) {
          try {
            console.log(
              `Itinerary attempt ${attempt}/3 for ${model}`
            );

            const {
              response,
              data,
            } = await askGemini(
              model,
              prompt
            );

            if (response.ok) {
              const itinerary =
                data.candidates?.[0]?.content?.parts
                  ?.map(
                    (part) => part.text || ""
                  )
                  .join("") || "";

              if (itinerary) {
                trip.itinerary = itinerary;

                await trip.save();

                console.log(
                  `Itinerary SUCCESS: ${model}`
                );

                return res.json({
                  message:
                    "AI itinerary generated successfully.",
                  itinerary,
                  trip,
                  model,
                });
              }
            }

            lastError =
              data.error?.message ||
              `Gemini ${model} failed`;

            console.log(
              "Gemini itinerary error:",
              lastError
            );

            if (
              response.status === 503 ||
              response.status === 429 ||
              response.status === 500 ||
              response.status === 504
            ) {
              const delay =
                2000 *
                Math.pow(2, attempt - 1);

              await wait(delay);

              continue;
            }

            return res
              .status(response.status)
              .json({
                message: lastError,
              });
          } catch (error) {
            lastError = error.message;

            console.log(
              "Itinerary request error:",
              error.message
            );

            const delay =
              2000 *
              Math.pow(2, attempt - 1);

            await wait(delay);
          }
        }

        console.log(
          "Moving to next Gemini itinerary model..."
        );
      }

      return res.status(503).json({
        message:
          "Gemini is temporarily overloaded. Please try again in a minute.",
        details: lastError,
      });
    } catch (err) {
      console.error(
        "Generate itinerary error:",
        err
      );

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

module.exports = router;