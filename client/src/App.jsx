import { useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import TripPlanner from "./components/TripPlanner";
import AIChat from "./components/AIChat";
import MyTrips from "./components/MyTrips";
import Weather from "./components/Weather";

function App() {
  const hasToken = !!localStorage.getItem("token");

  const [page, setPage] = useState(
    hasToken ? "home" : "signup"
  );

  const [destination, setDestination] = useState("");
  const [heroError, setHeroError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // =========================
  // HOME
  // =========================

  const goHome = () => {
    setPage("home");
    setMobileMenu(false);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  // =========================
  // SECTION NAVIGATION
  // =========================

  const goToSection = (id) => {
    setPage("home");
    setMobileMenu(false);

    setTimeout(() => {
      const section = document.getElementById(id);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingUser");

    setPage("signup");
    setMobileMenu(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // SIGNUP
  // =========================

  if (page === "signup") {
    return (
      <Signup
        onSignupSuccess={() => setPage("login")}
        onGoToLogin={() => setPage("login")}
      />
    );
  }

  // =========================
  // LOGIN
  // =========================

  if (page === "login") {
    return (
      <Login
        onLoginSuccess={() => {
          setPage("home");

          setTimeout(() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }, 50);
        }}
        onGoToSignup={() => setPage("signup")}
      />
    );
  }

  // =========================
  // PROTECTED WEBSITE
  // =========================

  if (!localStorage.getItem("token")) {
    setPage("signup");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">

          <div className="flex items-center justify-between">

            {/* LOGO */}

            <button
              onClick={goHome}
              className="flex items-center gap-3 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition">
                ✈️
              </div>

              <div className="text-left hidden sm:block">
                <h1 className="font-extrabold text-lg text-slate-900 leading-tight">
                  Smart Travel
                </h1>

                <p className="text-[10px] text-blue-600 font-bold tracking-widest">
                  PLAN • EXPLORE • TRAVEL
                </p>
              </div>
            </button>

            {/* DESKTOP NAV */}

            <div className="hidden lg:flex items-center gap-1">

              <button
                onClick={goHome}
                className="px-4 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-semibold transition"
              >
                Home
              </button>

              <button
                onClick={() =>
                  goToSection("destinations")
                }
                className="px-4 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-semibold transition"
              >
                Explore
              </button>

              <button
                onClick={() =>
                  goToSection("trip-planner")
                }
                className="px-4 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-semibold transition"
              >
                Plan Trip
              </button>

              <button
                onClick={() =>
                  goToSection("my-trips")
                }
                className="px-4 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-semibold transition"
              >
                My Trips
              </button>

              <button
                onClick={() =>
                  goToSection("weather")
                }
                className="px-4 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-semibold transition"
              >
                🌦️ Weather
              </button>

              <button
                onClick={() =>
                  goToSection("ai-assistant")
                }
                className="px-4 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-semibold transition"
              >
                🤖 AI Assistant
              </button>

            </div>

            {/* USER */}

            <div className="hidden md:flex items-center gap-3">

              {user && (
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-2 rounded-full">

                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>

                  <span className="font-semibold text-slate-700 text-sm">
                    Hi, {user.name}
                  </span>

                </div>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 font-semibold transition"
              >
                Logout
              </button>

            </div>

            {/* MOBILE MENU BUTTON */}

            <button
              onClick={() =>
                setMobileMenu(!mobileMenu)
              }
              className="lg:hidden w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl hover:bg-blue-50 transition"
            >
              {mobileMenu ? "✕" : "☰"}
            </button>

          </div>

          {/* MOBILE MENU */}

          {mobileMenu && (
            <div className="lg:hidden mt-4 pb-2 border-t border-slate-100 pt-4 space-y-2">

              <button
                onClick={goHome}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 font-semibold"
              >
                🏠 Home
              </button>

              <button
                onClick={() =>
                  goToSection("destinations")
                }
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 font-semibold"
              >
                🗺️ Explore
              </button>

              <button
                onClick={() =>
                  goToSection("trip-planner")
                }
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 font-semibold"
              >
                ✈️ Plan Trip
              </button>

              <button
                onClick={() =>
                  goToSection("my-trips")
                }
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 font-semibold"
              >
                🧳 My Trips
              </button>

              <button
                onClick={() =>
                  goToSection("weather")
                }
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 font-semibold"
              >
                🌦️ Weather
              </button>

              <button
                onClick={() =>
                  goToSection("ai-assistant")
                }
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 font-semibold"
              >
                🤖 AI Assistant
              </button>

              {user && (
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">

                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>

                  <span className="font-semibold">
                    {user.name}
                  </span>

                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-left"
              >
                🚪 Logout
              </button>

            </div>
          )}

        </div>

      </nav>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        id="home"
        className="relative min-h-[680px] flex items-center overflow-hidden"
      >

        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=85"
          alt="Beautiful travel destination"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/65 to-slate-950/40"></div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 w-full">

          <div className="max-w-3xl text-white">

            {/* BADGE */}

            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full mb-7 shadow-xl">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>

              <span className="font-semibold text-sm">
                AI-Powered Travel Planning
              </span>
            </div>

            {/* HEADING */}

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-7 tracking-tight">

              Explore the World.

              <span className="block mt-2 bg-gradient-to-r from-cyan-300 via-blue-300 to-white bg-clip-text text-transparent">
                Travel Smarter. 🌍
              </span>

            </h1>

            <p className="text-lg md:text-xl text-slate-200 leading-8 max-w-2xl mb-9">
              Plan unforgettable journeys with personalized AI
              itineraries, smart budgeting and intelligent travel
              assistance — all in one place.
            </p>

            {/* SEARCH */}

            <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl max-w-2xl flex flex-col sm:flex-row gap-2">

              <div className="flex-1 flex items-center">

                <span className="text-xl pl-4">
                  📍
                </span>

                <input
                  type="text"
                  placeholder="Where do you want to go? e.g. Paris, Bali, Tokyo"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setHeroError("");
                  }}
                  className="flex-1 px-4 py-4 text-slate-900 outline-none rounded-xl bg-transparent placeholder:text-slate-400"
                />

              </div>

              <button
                onClick={() => {

                  if (!destination.trim()) {
                    setHeroError(
                      "Please enter a destination first."
                    );
                    return;
                  }

                  setHeroError("");

                  goToSection("trip-planner");

                }}
                className="px-7 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl"
              >
                Plan My Trip ✈️
              </button>

            </div>

            {heroError && (
              <p className="mt-3 text-red-200 font-semibold">
                {heroError}
              </p>
            )}

            {/* QUICK POINTS */}

            <div className="flex flex-wrap gap-5 mt-7 text-sm text-slate-200">

              <span className="flex items-center gap-2">
                ✓ AI Itineraries
              </span>

              <span className="flex items-center gap-2">
                ✓ Smart Budget
              </span>

              <span className="flex items-center gap-2">
                ✓ AI Assistant
              </span>

            </div>

          </div>

        </div>

        {/* BOTTOM CURVE */}

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-50 rounded-t-[50%] scale-x-110 translate-y-10"></div>

      </section>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="bg-white border-b border-slate-100">

        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">

          <div className="text-center group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition">
              🤖
            </div>

            <p className="text-2xl font-extrabold text-slate-900">
              AI
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Smart Planning
            </p>
          </div>

          <div className="text-center group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition">
              💬
            </div>

            <p className="text-2xl font-extrabold text-slate-900">
              24/7
            </p>

            <p className="text-sm text-slate-500 mt-1">
              AI Assistant
            </p>
          </div>

          <div className="text-center group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition">
              🎯
            </div>

            <p className="text-2xl font-extrabold text-slate-900">
              100%
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Personalized
            </p>
          </div>

          <div className="text-center group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition">
              🌍
            </div>

            <p className="text-2xl font-extrabold text-slate-900">
              Anywhere
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Explore & Travel
            </p>
          </div>

        </div>

      </section>

      {/* =====================================================
          DESTINATIONS
      ===================================================== */}

      <section
        id="destinations"
        className="px-5 sm:px-6 py-24 bg-slate-50"
      >

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">

            <span className="inline-flex px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
              🌍 Explore the World
            </span>

            <h2 className="text-4xl md:text-5xl font-black mt-5 text-slate-900">
              Popular Destinations
            </h2>

            <p className="text-slate-500 mt-4 max-w-2xl mx-auto leading-7">
              Discover breathtaking destinations around the globe
              and use our AI planner to turn your travel idea into
              a complete trip.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">

            {/* PARIS */}

            <DestinationCard
              image="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=85"
              title="Paris"
              location="France"
              flag="🇫🇷"
              description="Iconic landmarks, world-class art and romantic streets."
              onPlan={() => goToSection("trip-planner")}
            />

            {/* BALI */}

            <DestinationCard
              image="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=85"
              title="Bali"
              location="Indonesia"
              flag="🇮🇩"
              description="Tropical beaches, rice terraces and vibrant culture."
              onPlan={() => goToSection("trip-planner")}
            />

            {/* DUBAI */}

            <DestinationCard
              image="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=85"
              title="Dubai"
              location="United Arab Emirates"
              flag="🇦🇪"
              description="Futuristic skyline, desert adventures and luxury shopping."
              onPlan={() => goToSection("trip-planner")}
            />

            {/* TOKYO */}

            <DestinationCard
              image="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=85"
              title="Tokyo"
              location="Japan"
              flag="🇯🇵"
              description="A dazzling mix of ancient temples and futuristic technology."
              onPlan={() => goToSection("trip-planner")}
            />

            {/* NEW YORK */}

            <DestinationCard
              image="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=85"
              title="New York"
              location="United States"
              flag="🇺🇸"
              description="The city that never sleeps — skyscrapers, culture and energy."
              onPlan={() => goToSection("trip-planner")}
            />

            {/* ISTANBUL */}

            <DestinationCard
              image="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=85"
              title="Istanbul"
              location="Turkey"
              flag="🇹🇷"
              description="Where East meets West — history, bazaars and stunning views."
              onPlan={() => goToSection("trip-planner")}
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          TRIP PLANNER
      ===================================================== */}

      <section
        id="trip-planner"
        className="px-5 sm:px-6 py-24 bg-white"
      >

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-12">

            <span className="inline-flex px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
              ✈️ Plan Your Adventure
            </span>

            <h2 className="text-4xl md:text-5xl font-black mt-5">
              Build Your Perfect Trip
            </h2>

            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
              Enter your destination, dates, travelers and budget.
              Our AI will create a personalized itinerary for you.
            </p>

          </div>

          <TripPlanner />

        </div>

      </section>

      {/* =====================================================
          MY TRIPS
      ===================================================== */}

      <section
        id="my-trips"
        className="px-5 sm:px-6 py-24 bg-slate-50"
      >

        <MyTrips />

      </section>

      {/* =====================================================
          WEATHER
      ===================================================== */}

      <Weather />

      {/* =====================================================
          AI ASSISTANT
      ===================================================== */}

      <section
        id="ai-assistant"
        className="px-5 sm:px-6 py-24 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white relative overflow-hidden"
      >

        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-6xl mx-auto">

          <div className="text-center mb-12">

            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 border border-white/20 text-4xl shadow-xl">
              🤖
            </div>

            <p className="text-cyan-300 font-bold uppercase tracking-widest text-sm mt-7">
              Your Personal AI
            </p>

            <h2 className="text-4xl md:text-5xl font-black mt-3">
              AI Travel Assistant
            </h2>

            <p className="text-slate-300 text-lg max-w-2xl mx-auto mt-5 leading-8">
              Ask anything about your destination, budget,
              activities, food, transportation and current trip.
            </p>

          </div>

          <AIChat />

        </div>

      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="px-5 sm:px-6 py-24 bg-white">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">

            <span className="inline-flex px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold">
              ⚡ Powerful Travel Tools
            </span>

            <h2 className="text-4xl md:text-5xl font-black mt-5">
              Everything You Need
            </h2>

            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
              One platform for planning, managing and enjoying your
              next adventure.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-7">

            <FeatureCard
              icon="🤖"
              title="AI Itinerary"
              description="Get personalized day-by-day travel plans generated according to your destination, budget and dates."
              color="blue"
            />

            <FeatureCard
              icon="💰"
              title="Smart Budget"
              description="Track your expenses, monitor your remaining budget and keep your travel spending organized."
              color="emerald"
            />

            <FeatureCard
              icon="🧳"
              title="Manage Trips"
              description="Create, save and manage all your travel plans from one convenient dashboard."
              color="purple"
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="px-5 sm:px-6 py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">

        <div className="max-w-5xl mx-auto text-center text-white">

          <div className="text-5xl mb-5">
            🌍✈️
          </div>

          <h2 className="text-4xl md:text-5xl font-black">
            Ready for Your Next Adventure?
          </h2>

          <p className="text-blue-100 text-lg mt-5 max-w-2xl mx-auto">
            Let Smart Travel Planner turn your destination idea
            into an organized, budget-friendly journey.
          </p>

          <button
            onClick={() =>
              goToSection("trip-planner")
            }
            className="mt-8 px-8 py-4 bg-white text-blue-700 rounded-2xl font-extrabold shadow-xl hover:scale-105 transition"
          >
            Start Planning ✈️
          </button>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-slate-950 text-white">

        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 grid md:grid-cols-3 gap-12">

          {/* BRAND */}

          <div>

            <div className="flex items-center gap-3 mb-5">

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-2xl">
                ✈️
              </div>

              <div>

                <h3 className="font-extrabold text-xl">
                  Smart Travel Planner
                </h3>

                <p className="text-xs text-cyan-400 font-semibold tracking-widest">
                  PLAN • EXPLORE • TRAVEL
                </p>

              </div>

            </div>

            <p className="text-slate-400 leading-7 max-w-md">
              Your intelligent travel companion for planning
              unforgettable journeys around the world with
              AI-powered tools.
            </p>

          </div>

          {/* EXPLORE */}

          <div>

            <h4 className="font-bold text-lg mb-5">
              Explore
            </h4>

            <div className="space-y-3 text-slate-400">

              <button
                onClick={() =>
                  goToSection("destinations")
                }
                className="block hover:text-white hover:translate-x-1 transition"
              >
                Popular Destinations
              </button>

              <button
                onClick={() =>
                  goToSection("trip-planner")
                }
                className="block hover:text-white hover:translate-x-1 transition"
              >
                AI Travel Planner
              </button>

              <button
                onClick={() =>
                  goToSection("my-trips")
                }
                className="block hover:text-white hover:translate-x-1 transition"
              >
                My Trips
              </button>

              <button
                onClick={() =>
                  goToSection("ai-assistant")
                }
                className="block hover:text-white hover:translate-x-1 transition"
              >
                AI Assistant
              </button>

            </div>

          </div>

          {/* ACCOUNT */}

          <div>

            <h4 className="font-bold text-lg mb-5">
              Your Account
            </h4>

            <p className="text-slate-500 text-sm">
              Logged in as
            </p>

            <p className="text-cyan-400 font-semibold mt-2 break-all">
              {user?.email}
            </p>

            <button
              onClick={handleLogout}
              className="mt-6 px-5 py-3 border border-slate-700 rounded-xl hover:bg-slate-800 transition font-semibold"
            >
              🚪 Logout
            </button>

          </div>

        </div>

        <div className="border-t border-slate-800 text-center py-6 text-slate-500 text-sm">
          © 2026 Smart Travel Planner. All rights reserved.
        </div>

      </footer>

    </div>
  );
}

/* =========================================================
   DESTINATION CARD
========================================================= */

function DestinationCard({
  image,
  title,
  location,
  flag,
  description,
  onPlan,
}) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-500">

      <div className="relative h-64 overflow-hidden">

        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

        <div className="absolute bottom-4 left-5 right-5">

          <span className="inline-flex px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-slate-700">
            {flag} {location}
          </span>

        </div>

      </div>

      <div className="p-6">

        <h3 className="text-2xl font-extrabold text-slate-900">
          {title}
        </h3>

        <p className="text-blue-600 font-semibold text-sm mt-2">
          {location}
        </p>

        <p className="text-slate-500 mt-3 leading-7">
          {description}
        </p>

        <button
          onClick={onPlan}
          className="mt-5 w-full py-3 rounded-xl bg-slate-100 text-slate-800 font-bold hover:bg-blue-600 hover:text-white transition"
        >
          Plan a Trip →
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon,
  title,
  description,
  color,
}) {
  const styles = {
    blue: "bg-blue-50 border-blue-100 hover:border-blue-300",
    emerald:
      "bg-emerald-50 border-emerald-100 hover:border-emerald-300",
    purple:
      "bg-purple-50 border-purple-100 hover:border-purple-300",
  };

  return (
    <div
      className={`p-8 rounded-3xl border hover:shadow-2xl hover:-translate-y-2 transition duration-500 ${styles[color]}`}
    >

      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-sm mb-6">
        {icon}
      </div>

      <h3 className="text-2xl font-extrabold mb-3">
        {title}
      </h3>

      <p className="text-slate-600 leading-7">
        {description}
      </p>

    </div>
  );
}

export default App;