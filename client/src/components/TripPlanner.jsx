import { useState } from "react";
import axios from "axios";

// "1lakh", "1 crore", "10 thousand", "50k", "10000" jaise text ko number mein badalta hai
const parseBudgetInput = (value) => {
  if (!value) return 0;

  let text = value.toString().toLowerCase().trim();
  text = text.replace(/,/g, "");

  const match = text.match(
    /^([\d.]+)\s*(lakh|lac|crore|cr|thousand|k|million|m|billion|b)?$/
  );

  if (!match) {
    const plain = Number(text.replace(/[^\d.]/g, ""));
    return Number.isNaN(plain) ? 0 : plain;
  }

  const num = parseFloat(match[1]);
  const unit = match[2];

  const multipliers = {
    lakh: 100000,
    lac: 100000,
    crore: 10000000,
    cr: 10000000,
    thousand: 1000,
    k: 1000,
    million: 1000000,
    m: 1000000,
    billion: 1000000000,
    b: 1000000000,
  };

  if (unit && multipliers[unit]) {
    return Math.round(num * multipliers[unit]);
  }

  return Math.round(num);
};

function TripPlanner() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("");

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [tripId, setTripId] = useState("");
  const [itinerary, setItinerary] = useState("");

  const parsedBudget = parseBudgetInput(budget);

  // AI text ko clean aur properly format karne ke liye
  const formatItinerary = (text) => {
    const lines = text.split("\n");

    return lines.map((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return (
          <div
            key={index}
            className="h-3"
          ></div>
        );
      }

      if (/^#{1,6}\s+/.test(trimmed)) {
        const heading = trimmed
          .replace(/^#{1,6}\s+/, "")
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .trim();

        return (
          <h3
            key={index}
            className="text-xl font-bold text-slate-900 mt-7 mb-3"
          >
            {heading}
          </h3>
        );
      }

      if (/^day\s+\d+/i.test(trimmed)) {
        const heading = trimmed
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .trim();

        return (
          <h3
            key={index}
            className="text-xl font-bold text-slate-900 mt-7 mb-3"
          >
            {heading}
          </h3>
        );
      }

      const cleanForCheck = trimmed
        .replace(/^#{1,6}\s+/, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .trim();

      if (
        /^(budget breakdown|budget breakdown summary|money-saving tips|money saving tips|practical tips|travel tips|accommodation strategy|core budget strategy|daily activity details|budget strategy|estimated cost breakdown|the \d+-day budget itinerary|total budget|money-saving tips for|travel tips for)/i.test(
          cleanForCheck
        )
      ) {
        const heading = cleanForCheck;

        return (
          <h3
            key={index}
            className="text-xl font-bold text-slate-900 mt-7 mb-3"
          >
            {heading}
          </h3>
        );
      }

      const cleanLine = trimmed
        .replace(/#{1,6}\s*/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/`/g, "")
        .replace(/^-\s*/, "")
        .trim();

      return (
        <p
          key={index}
          className="text-slate-700 leading-8 mb-2"
        >
          {cleanLine}
        </p>
      );
    });
  };

  // --------------------------------
  // CREATE TRIP
  // --------------------------------

  const handleCreateTrip = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");
    setItinerary("");
    setTripId("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      if (!parsedBudget || parsedBudget <= 0) {
        setError("Please enter a valid budget (e.g. 50000, 1lakh, 1 crore).");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/trips",
        {
          destination,
          startDate,
          endDate,
          budget: parsedBudget,
          travelers: Number(travelers),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTripId(response.data._id);

      setMessage(
        "🎉 Trip created successfully!"
      );
    } catch (err) {
      console.error(
        "Trip creation error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Trip create nahi ho saki."
        );
      } else if (err.request) {
        setError(
          "Backend server se connection nahi ho raha."
        );
      } else {
        setError(
          "Something went wrong."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // GENERATE AI ITINERARY
  // --------------------------------

  const handleGenerateItinerary = async () => {
    setAiLoading(true);
    setError("");
    setItinerary("");

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setAiLoading(false);
        return;
      }

      if (!tripId) {
        setError(
          "Please create a trip first."
        );
        setAiLoading(false);
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/trips/${tripId}/itinerary`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setItinerary(
        response.data.itinerary
      );

      setMessage(
        "🤖 AI itinerary generated successfully!"
      );
    } catch (err) {
      console.error(
        "AI itinerary error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            "AI itinerary generate nahi ho saki."
        );
      } else if (err.request) {
        setError(
          "Backend server se connection nahi ho raha."
        );
      } else {
        setError(
          "Something went wrong."
        );
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section className="px-6 py-16 bg-slate-50">
      <div className="max-w-5xl mx-auto">

        {/* -------------------------------- */}
        {/* PAGE HEADING */}
        {/* -------------------------------- */}

        <div className="text-center mb-10">

          <div className="text-5xl mb-4">
            ✈️
          </div>

          <h2 className="text-4xl font-bold text-slate-900">
            Create Your Trip
          </h2>

          <p className="text-slate-600 mt-3">
            Enter your travel details and let AI
            create your personalized itinerary.
          </p>

        </div>

        {/* -------------------------------- */}
        {/* TRIP FORM */}
        {/* -------------------------------- */}

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">

          {/* Success message */}

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
              {message}
            </div>
          )}

          {/* Error message */}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateTrip}>

            {/* Destination */}

            <div className="mb-6">

              <label className="block mb-2 font-semibold text-slate-700">
                Destination
              </label>

              <input
                type="text"
                placeholder="Where do you want to go? e.g. Paris, Bali, Tokyo"
                value={destination}
                onChange={(e) =>
                  setDestination(e.target.value)
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />

            </div>

            {/* Dates */}

            <div className="grid md:grid-cols-2 gap-6 mb-6">

              {/* Start Date */}

              <div>

                <label className="block mb-2 font-semibold text-slate-700">
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

              {/* End Date */}

              <div>

                <label className="block mb-2 font-semibold text-slate-700">
                  End Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

            </div>

            {/* Budget + Travelers */}

            <div className="grid md:grid-cols-2 gap-6 mb-7">

              {/* Budget */}

              <div>

                <label className="block mb-2 font-semibold text-slate-700">
                  Total Budget
                </label>

                <input
                  type="text"
                  placeholder="e.g. 50000, 1lakh, 1 crore, 10thousand"
                  value={budget}
                  onChange={(e) =>
                    setBudget(e.target.value)
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                {budget && (
                  <p className="text-sm text-slate-500 mt-2">
                    {parsedBudget > 0
                      ? `= ${parsedBudget.toLocaleString()}`
                      : "Please enter a valid amount"}
                  </p>
                )}

              </div>

              {/* Travelers */}

              <div>

                <label className="block mb-2 font-semibold text-slate-700">
                  Number of Travelers
                </label>

                <input
                  type="number"
                  placeholder="e.g. 2"
                  value={travelers}
                  onChange={(e) =>
                    setTravelers(e.target.value)
                  }
                  min="1"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

            </div>

            {/* Create Trip Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {loading
                ? "Creating Trip..."
                : "Create My Trip ✈️"}
            </button>

          </form>

          {/* -------------------------------- */}
          {/* AI BUTTON */}
          {/* -------------------------------- */}

          {tripId && (
            <div className="mt-6">

              <button
                type="button"
                onClick={
                  handleGenerateItinerary
                }
                disabled={aiLoading}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition disabled:bg-purple-400"
              >
                {aiLoading
                  ? "🤖 AI is planning your trip..."
                  : "🤖 Generate AI Itinerary"}
              </button>

            </div>
          )}

        </div>

        {/* -------------------------------- */}
        {/* AI ITINERARY */}
        {/* -------------------------------- */}

        {itinerary && (
          <div className="mt-10">

            {/* AI HEADER */}

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-3xl p-7">

              <div className="flex items-center gap-4">

                <div className="text-5xl">
                  🤖
                </div>

                <div>

                  <h2 className="text-3xl font-bold">
                    Your AI Travel Itinerary
                  </h2>

                  <p className="text-blue-100 mt-1">
                    Personalized plan generated by Gemini
                  </p>

                </div>

              </div>

            </div>

            {/* AI CONTENT */}

            <div className="bg-white rounded-b-3xl shadow-xl p-8 border border-slate-100">

              <div>
                {formatItinerary(
                  itinerary
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}

export default TripPlanner;