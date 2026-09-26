import { useEffect, useState } from "react";
import axios from "axios";

function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [deleting, setDeleting] = useState("");
  const [deletingExpense, setDeletingExpense] = useState("");

  const [expenseCategory, setExpenseCategory] =
    useState("Food");

  const [expenseAmount, setExpenseAmount] =
    useState("");

  const [expenseNote, setExpenseNote] =
    useState("");

  const [addingExpense, setAddingExpense] =
    useState(false);

  const [expenseError, setExpenseError] =
    useState("");

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/trips",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTrips(response.data);

      if (response.data.length > 0) {
        setSelectedTrip(response.data[0]);
      }
    } catch (error) {
      console.error(
        "Trips loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getDays = (trip) => {
    if (
      !trip?.startDate ||
      !trip?.endDate
    ) {
      return 0;
    }

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);

    return (
      Math.ceil(
        (end - start) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const getTotalSpent = (trip) => {
    if (!trip?.expenses?.length) {
      return 0;
    }

    return trip.expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );
  };

  const getRemaining = (trip) => {
    return (
      Number(trip?.budget || 0) -
      getTotalSpent(trip)
    );
  };

  const getPercentage = (trip) => {
    const budget = Number(
      trip?.budget || 0
    );

    if (!budget) return 0;

    return Math.min(
      (getTotalSpent(trip) / budget) * 100,
      100
    );
  };

  const addExpense = async (e) => {
    e.preventDefault();

    setExpenseError("");

    if (!selectedTrip) {
      setExpenseError(
        "Please select a trip first."
      );
      return;
    }

    if (!expenseAmount) {
      setExpenseError(
        "Please enter expense amount."
      );
      return;
    }

    if (Number(expenseAmount) <= 0) {
      setExpenseError(
        "Amount must be greater than 0."
      );
      return;
    }

    try {
      setAddingExpense(true);

      const token =
        localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/trips/${selectedTrip._id}/expenses`,
        {
          category: expenseCategory,
          amount: Number(expenseAmount),
          note: expenseNote,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedTrip =
        response.data.trip;

      setTrips((prevTrips) =>
        prevTrips.map((trip) =>
          trip._id === updatedTrip._id
            ? updatedTrip
            : trip
        )
      );

      setSelectedTrip(updatedTrip);

      setExpenseAmount("");
      setExpenseNote("");
      setExpenseCategory("Food");
    } catch (error) {
      console.error(
        "Add expense error:",
        error
      );

      setExpenseError(
        error.response?.data?.message ||
          "Could not add expense."
      );
    } finally {
      setAddingExpense(false);
    }
  };

  const deleteExpense = async (
    expenseId
  ) => {
    try {
      setDeletingExpense(expenseId);

      const token =
        localStorage.getItem("token");

      const response = await axios.delete(
        `http://localhost:5000/api/trips/${selectedTrip._id}/expenses/${expenseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedTrip =
        response.data.trip;

      setTrips((prevTrips) =>
        prevTrips.map((trip) =>
          trip._id === updatedTrip._id
            ? updatedTrip
            : trip
        )
      );

      setSelectedTrip(updatedTrip);
    } catch (error) {
      console.error(
        "Delete expense error:",
        error
      );
    } finally {
      setDeletingExpense("");
    }
  };

  const deleteTrip = async (id) => {
    try {
      setDeleting(id);

      const token =
        localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/trips/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedTrips =
        trips.filter(
          (trip) => trip._id !== id
        );

      setTrips(updatedTrips);

      if (selectedTrip?._id === id) {
        setSelectedTrip(
          updatedTrips[0] || null
        );
      }
    } catch (error) {
      console.error(
        "Delete trip error:",
        error
      );
    } finally {
      setDeleting("");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">
            ✈️
          </div>

          <p className="text-slate-500">
            Loading your trips...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">

      {/* HEADER */}

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-3xl mb-4">
          🧳
        </div>

        <p className="text-blue-600 font-bold uppercase tracking-widest text-sm">
          Your Travel Collection
        </p>

        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-2">
          My Trips
        </h2>

        <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
          Manage your saved adventures,
          AI itinerary and travel budget
          in one place.
        </p>
      </div>

      {/* NO TRIPS */}

      {trips.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-100">
          <div className="text-7xl mb-6">
            🌍
          </div>

          <h3 className="text-2xl font-bold text-slate-900">
            No trips yet
          </h3>

          <p className="text-slate-500 mt-3">
            Create your first trip and let
            AI plan your adventure.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">

          {/* SAVED TRIPS */}

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-5 border border-slate-100">

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-slate-900">
                  Saved Trips
                </h3>

                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                  {trips.length}
                </span>
              </div>

              <div className="space-y-3">
                {trips.map((trip) => (
                  <button
                    key={trip._id}
                    onClick={() =>
                      setSelectedTrip(trip)
                    }
                    className={`w-full text-left p-4 rounded-2xl border transition ${
                      selectedTrip?._id ===
                      trip._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">

                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl shrink-0">
                        📍
                      </div>

                      <div className="min-w-0">

                        <h4 className="font-bold text-slate-900 truncate">
                          {trip.destination}
                        </h4>

                        <p className="text-sm text-slate-500 mt-1">
                          {formatDate(
                            trip.startDate
                          )}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {trip.travelers}{" "}
                          travelers
                        </p>

                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SELECTED TRIP */}

          {selectedTrip && (
            <div className="lg:col-span-2 space-y-8">

              {/* TRIP CARD */}

              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">

                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white">

                  <div className="absolute right-8 top-6 text-7xl opacity-20">
                    ✈️
                  </div>

                  <p className="text-blue-100 font-semibold">
                    YOUR ADVENTURE
                  </p>

                  <h3 className="text-4xl font-bold mt-2">
                    {selectedTrip.destination}
                  </h3>

                  <p className="text-blue-100 mt-2">
                    {formatDate(
                      selectedTrip.startDate
                    )}
                    {" — "}
                    {formatDate(
                      selectedTrip.endDate
                    )}
                  </p>
                </div>

                {/* TRIP INFO */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50">

                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-semibold uppercase">
                      Duration
                    </p>

                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {getDays(
                        selectedTrip
                      )}{" "}
                      Days
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-semibold uppercase">
                      Travelers
                    </p>

                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {
                        selectedTrip.travelers
                      }
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-semibold uppercase">
                      Budget
                    </p>

                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {Number(
                        selectedTrip.budget
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-semibold uppercase">
                      AI Plan
                    </p>

                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {selectedTrip.itinerary
                        ? "Ready"
                        : "Pending"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ======================
                  BUDGET TRACKER
              ====================== */}

              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-7 text-white">

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                      💰
                    </div>

                    <div>
                      <p className="text-emerald-100 font-semibold uppercase text-sm">
                        Smart Budget
                      </p>

                      <h3 className="text-3xl font-bold">
                        Budget Tracker
                      </h3>
                    </div>
                  </div>
                </div>

                {/* BUDGET SUMMARY */}

                <div className="p-6">

                  <div className="grid md:grid-cols-3 gap-4">

                    <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
                      <p className="text-sm font-semibold text-blue-600">
                        Total Budget
                      </p>

                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {Number(
                          selectedTrip.budget
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-red-50 border border-red-100 p-5">
                      <p className="text-sm font-semibold text-red-600">
                        Total Spent
                      </p>

                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {getTotalSpent(
                          selectedTrip
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl border p-5 ${
                        getRemaining(
                          selectedTrip
                        ) >= 0
                          ? "bg-emerald-50 border-emerald-100"
                          : "bg-red-50 border-red-100"
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${
                          getRemaining(
                            selectedTrip
                          ) >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        Remaining
                      </p>

                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {getRemaining(
                          selectedTrip
                        ).toLocaleString()}
                      </p>
                    </div>

                  </div>

                  {/* PROGRESS */}

                  <div className="mt-7">

                    <div className="flex justify-between mb-2">

                      <span className="text-sm font-semibold text-slate-600">
                        Budget Used
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {getPercentage(
                          selectedTrip
                        ).toFixed(0)}
                        %
                      </span>

                    </div>

                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">

                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          getPercentage(
                            selectedTrip
                          ) >= 90
                            ? "bg-red-500"
                            : getPercentage(
                                selectedTrip
                              ) >= 70
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${getPercentage(
                            selectedTrip
                          )}%`,
                        }}
                      ></div>

                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      {getTotalSpent(
                        selectedTrip
                      ).toLocaleString()}{" "}
                      spent out of{" "}
                      {Number(
                        selectedTrip.budget
                      ).toLocaleString()}
                    </p>

                  </div>

                  {/* ADD EXPENSE */}

                  <div className="mt-8 pt-7 border-t border-slate-100">

                    <h4 className="text-xl font-bold text-slate-900">
                      Add Expense
                    </h4>

                    <p className="text-sm text-slate-500 mt-1">
                      Track every expense during
                      your trip.
                    </p>

                    <form
                      onSubmit={addExpense}
                      className="mt-5"
                    >

                      <div className="grid md:grid-cols-2 gap-4">

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Category
                          </label>

                          <select
                            value={
                              expenseCategory
                            }
                            onChange={(e) =>
                              setExpenseCategory(
                                e.target.value
                              )
                            }
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option>
                              Food
                            </option>
                            <option>
                              Hotel
                            </option>
                            <option>
                              Transport
                            </option>
                            <option>
                              Activities
                            </option>
                            <option>
                              Shopping
                            </option>
                            <option>
                              Other
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Amount
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              expenseAmount
                            }
                            onChange={(e) => {
                              setExpenseAmount(
                                e.target.value
                              );
                              setExpenseError(
                                ""
                              );
                            }}
                            placeholder="e.g. 25"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                      </div>

                      <div className="mt-4">

                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Note
                        </label>

                        <input
                          type="text"
                          value={expenseNote}
                          onChange={(e) =>
                            setExpenseNote(
                              e.target.value
                            )
                          }
                          placeholder="e.g. Dinner at local restaurant"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                      </div>

                      {expenseError && (
                        <p className="mt-3 text-sm font-medium text-red-600">
                          {expenseError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={addingExpense}
                        className="mt-5 w-full md:w-auto px-7 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {addingExpense
                          ? "Adding..."
                          : "➕ Add Expense"}
                      </button>

                    </form>
                  </div>

                  {/* EXPENSE LIST */}

                  <div className="mt-9 pt-7 border-t border-slate-100">

                    <div className="flex items-center justify-between mb-5">

                      <div>
                        <p className="text-sm text-blue-600 font-bold uppercase tracking-wide">
                          Spending History
                        </p>

                        <h4 className="text-2xl font-bold text-slate-900">
                          Your Expenses
                        </h4>
                      </div>

                      <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-bold text-slate-600">
                        {
                          selectedTrip.expenses
                            ?.length || 0
                        }
                      </span>

                    </div>

                    {!selectedTrip.expenses ||
                    selectedTrip.expenses.length ===
                      0 ? (
                      <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-8 text-center">

                        <div className="text-5xl mb-3">
                          💳
                        </div>

                        <p className="font-bold text-slate-700">
                          No expenses yet
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          Add your first expense
                          above.
                        </p>

                      </div>
                    ) : (
                      <div className="space-y-3">

                        {[
                          ...selectedTrip.expenses,
                        ]
                          .reverse()
                          .map(
                            (expense) => (
                              <div
                                key={
                                  expense._id
                                }
                                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm transition"
                              >

                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm">
                                  {expense.category ===
                                  "Food"
                                    ? "🍔"
                                    : expense.category ===
                                      "Hotel"
                                    ? "🏨"
                                    : expense.category ===
                                      "Transport"
                                    ? "🚗"
                                    : expense.category ===
                                      "Activities"
                                    ? "🎯"
                                    : expense.category ===
                                      "Shopping"
                                    ? "🛍️"
                                    : "💳"}
                                </div>

                                <div className="flex-1 min-w-0">

                                  <p className="font-bold text-slate-900">
                                    {
                                      expense.category
                                    }
                                  </p>

                                  <p className="text-sm text-slate-500 truncate">
                                    {expense.note ||
                                      "No note"}
                                  </p>

                                  <p className="text-xs text-slate-400 mt-1">
                                    {formatDate(
                                      expense.date
                                    )}
                                  </p>

                                </div>

                                <div className="text-right">

                                  <p className="font-bold text-red-600">
                                    -
                                    {Number(
                                      expense.amount
                                    ).toLocaleString()}
                                  </p>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteExpense(
                                        expense._id
                                      )
                                    }
                                    disabled={
                                      deletingExpense ===
                                      expense._id
                                    }
                                    className="text-xs text-red-500 hover:text-red-700 mt-1 disabled:opacity-50"
                                  >
                                    {deletingExpense ===
                                    expense._id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </button>

                                </div>

                              </div>
                            )
                          )}

                      </div>
                    )}

                  </div>

                </div>
              </div>

              {/* AI ITINERARY */}

              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">

                <div className="p-6 md:p-8">

                  <div className="flex items-center justify-between gap-4 mb-5">

                    <div>
                      <p className="text-sm text-blue-600 font-bold uppercase tracking-wide">
                        AI Generated
                      </p>

                      <h4 className="text-2xl font-bold text-slate-900">
                        Your Itinerary
                      </h4>
                    </div>

                    <span className="text-3xl">
                      🤖
                    </span>

                  </div>

                  {selectedTrip.itinerary ? (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <div className="whitespace-pre-wrap text-slate-700 leading-8 text-sm md:text-base max-h-[600px] overflow-y-auto">
                        {
                          selectedTrip.itinerary
                        }
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                      <p className="font-bold text-amber-800">
                        No AI itinerary yet
                      </p>

                      <p className="text-amber-700 text-sm mt-2">
                        Generate an AI itinerary
                        from the Trip Planner.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end mt-6">

                    <button
                      onClick={() =>
                        deleteTrip(
                          selectedTrip._id
                        )
                      }
                      disabled={
                        deleting ===
                        selectedTrip._id
                      }
                      className="px-5 py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition disabled:opacity-50"
                    >
                      {deleting ===
                      selectedTrip._id
                        ? "Deleting..."
                        : "🗑️ Delete Trip"}
                    </button>

                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyTrips;