const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
    },

    travelers: {
      type: Number,
      default: 1,
    },

    itinerary: {
      type: String,
      default: "",
    },

    expenses: {
      type: [
        {
          category: {
            type: String,
            required: true,
          },

          amount: {
            type: Number,
            required: true,
            min: 0,
          },

          note: {
            type: String,
            default: "",
            trim: true,
          },

          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);