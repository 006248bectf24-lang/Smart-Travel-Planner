import { useEffect, useState } from "react";
import axios from "axios";

function AIChat() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! 👋 I am your Smart Travel AI Assistant. Ask me anything about your trip, destination, budget, activities or transportation.",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // User ki trips load karo
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const response = await axios.get(
          "http://localhost:5000/api/trips",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTrips(response.data);

        // Latest trip automatically select
        if (response.data.length > 0) {
          setSelectedTrip(response.data[0]);
        }
      } catch (err) {
        console.error("Trips load error:", err);
      }
    };

    fetchTrips();
  }, []);

  // AI message send
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    const userMessage = message.trim();

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "Please login first to use the AI Travel Assistant.",
          },
        ]);

        setLoading(false);
        return;
      }

      const tripContext = selectedTrip
        ? {
            destination: selectedTrip.destination,
            startDate: selectedTrip.startDate,
            endDate: selectedTrip.endDate,
            budget: selectedTrip.budget,
            travelers: selectedTrip.travelers,
          }
        : null;

      const response = await axios.post(
        "http://localhost:5000/api/chat",
        {
          message: userMessage,
          tripContext: tripContext,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            response.data.answer ||
            "Sorry, AI could not answer right now.",
        },
      ]);
    } catch (err) {
      console.error("AI chat error:", err);

      let errorMessage =
        "AI se connection nahi ho saka. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Clean AI response
  const cleanText = (text) => {
    return text
      .replace(/#{1,6}\s*/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .trim();
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* Selected Trip */}

      {trips.length > 0 && (
        <div className="mb-5 bg-white/10 border border-white/10 rounded-2xl p-4">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div>
              <p className="text-sm text-cyan-300 font-semibold">
                Current Trip
              </p>

              <p className="font-bold text-white">
                {selectedTrip?.destination || "Select a trip"}
              </p>
            </div>

            <select
              value={selectedTrip?._id || ""}
              onChange={(e) => {
                const trip = trips.find(
                  (item) => item._id === e.target.value
                );

                setSelectedTrip(trip);
              }}
              className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 outline-none"
            >
              {trips.map((trip) => (
                <option
                  key={trip._id}
                  value={trip._id}
                >
                  {trip.destination} — {trip.travelers} travelers
                </option>
              ))}
            </select>

          </div>

        </div>
      )}

      {/* Chat Box */}

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Chat Header */}

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
              🤖
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Smart Travel AI
              </h3>

              <p className="text-blue-100 text-sm">
                Your personal travel assistant
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full"></span>

              <span className="text-white text-sm">
                Online
              </span>
            </div>

          </div>

        </div>

        {/* Messages */}

        <div className="h-[430px] overflow-y-auto p-5 bg-slate-50">

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-5 ${
                msg.sender === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-sm"
                }`}
              >

                <div className="text-xs font-semibold mb-2 opacity-70">
                  {msg.sender === "user"
                    ? "You"
                    : "🤖 AI Assistant"}
                </div>

                <p className="leading-7 whitespace-pre-wrap">
                  {cleanText(msg.text)}
                </p>

              </div>

            </div>
          ))}

          {loading && (
            <div className="flex justify-start mb-5">

              <div className="bg-white shadow-sm border border-slate-100 rounded-2xl rounded-bl-sm px-5 py-4">

                <div className="flex items-center gap-2">

                  <span className="text-sm text-slate-500">
                    AI is thinking
                  </span>

                  <span className="animate-bounce">
                    ●
                  </span>

                  <span
                    className="animate-bounce"
                    style={{
                      animationDelay: "0.15s",
                    }}
                  >
                    ●
                  </span>

                  <span
                    className="animate-bounce"
                    style={{
                      animationDelay: "0.3s",
                    }}
                  >
                    ●
                  </span>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* Suggested Questions */}

        <div className="px-5 pt-5">

          <p className="text-xs text-slate-500 font-semibold mb-3">
            Try asking:
          </p>

          <div className="flex gap-2 overflow-x-auto pb-2">

            {[
              "What should I visit?",
              "Suggest budget activities",
              "What food should I try?",
              "How can I save money?",
            ].map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => setMessage(question)}
                className="whitespace-nowrap px-3 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-sm transition"
              >
                {question}
              </button>
            ))}

          </div>

        </div>

        {/* Input */}

        <form
          onSubmit={sendMessage}
          className="p-5"
        >

          <div className="flex gap-3 bg-slate-100 rounded-2xl p-2">

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask your travel question..."
              disabled={loading}
              className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-800 placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Send ✈️"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AIChat;