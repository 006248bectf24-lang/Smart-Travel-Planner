import { useState } from "react";

function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeather = async (e) => {
    e.preventDefault();

    if (!city.trim()) {
      setError("Please enter a destination.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);
    setLocation(null);

    try {
      // Find city coordinates
      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=en&format=json`
      );

      const locationData = await locationResponse.json();

      if (!locationData.results || locationData.results.length === 0) {
        setError("Destination not found. Try another city.");
        setLoading(false);
        return;
      }

      const place = locationData.results[0];

      // Get weather
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`
      );

      const weatherData = await weatherResponse.json();

      setLocation(place);
      setWeather(weatherData);
    } catch (err) {
      setError("Weather information load nahi ho saki.");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Light rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Light rain showers",
      81: "Moderate rain showers",
      82: "Heavy rain showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with heavy hail",
    };

    return weatherCodes[code] || "Unknown weather";
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️";
    if ([1, 2].includes(code)) return "🌤️";
    if ([3].includes(code)) return "☁️";
    if ([45, 48].includes(code)) return "🌫️";

    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return "🌧️";
    }

    if ([71, 73, 75].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";

    return "🌤️";
  };

  return (
    <section
      id="weather"
      className="py-20 bg-slate-50"
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-10">

          <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
            🌦️ Live Weather
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            Check Destination Weather
          </h2>

          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Check current weather and a 5-day forecast before planning your
            journey.
          </p>

        </div>

        {/* Search */}
        <form
          onSubmit={getWeather}
          className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 mb-10"
        >

          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter destination e.g. Hunza"
            className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-60"
          >
            {loading ? "Checking..." : "Check Weather"}
          </button>

        </form>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Weather Result */}
        {weather && location && (
          <div className="space-y-6">

            {/* Current Weather */}
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white p-8 shadow-xl">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                <div>

                  <p className="text-blue-100 mb-2">
                    Current Weather
                  </p>

                  <h3 className="text-3xl font-bold">
                    {location.name}
                    {location.country
                      ? `, ${location.country}`
                      : ""}
                  </h3>

                  <p className="mt-2 text-blue-100">
                    {getWeatherDescription(
                      weather.current.weather_code
                    )}
                  </p>

                </div>

                <div className="text-center">

                  <div className="text-6xl">
                    {getWeatherIcon(
                      weather.current.weather_code
                    )}
                  </div>

                  <div className="text-5xl font-bold mt-2">
                    {Math.round(
                      weather.current.temperature_2m
                    )}
                    °C
                  </div>

                </div>

              </div>

              {/* Current stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

                <div className="bg-white/15 rounded-2xl p-4">

                  <p className="text-blue-100 text-sm">
                    Feels Like
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {Math.round(
                      weather.current.apparent_temperature
                    )}
                    °C
                  </p>

                </div>

                <div className="bg-white/15 rounded-2xl p-4">

                  <p className="text-blue-100 text-sm">
                    Humidity
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {weather.current.relative_humidity_2m}%
                  </p>

                </div>

                <div className="bg-white/15 rounded-2xl p-4">

                  <p className="text-blue-100 text-sm">
                    Wind
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {Math.round(
                      weather.current.wind_speed_10m
                    )}{" "}
                    km/h
                  </p>

                </div>

                <div className="bg-white/15 rounded-2xl p-4">

                  <p className="text-blue-100 text-sm">
                    Rain
                  </p>

                  <p className="text-xl font-bold mt-1">
                    {weather.current.precipitation} mm
                  </p>

                </div>

              </div>

            </div>

            {/* Forecast */}
            <div>

              <h3 className="text-2xl font-bold text-slate-900 mb-5">
                5-Day Forecast
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                {weather.daily.time.map((date, index) => (

                  <div
                    key={date}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition"
                  >

                    <p className="text-sm text-slate-500">

                      {new Date(date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        }
                      )}

                    </p>

                    <div className="text-4xl my-4">

                      {getWeatherIcon(
                        weather.daily.weather_code[index]
                      )}

                    </div>

                    <p className="font-semibold text-slate-800">

                      {getWeatherDescription(
                        weather.daily.weather_code[index]
                      )}

                    </p>

                    <div className="flex justify-between mt-4">

                      <span className="font-bold text-slate-900">

                        {Math.round(
                          weather.daily.temperature_2m_max[index]
                        )}
                        °

                      </span>

                      <span className="text-slate-500">

                        {Math.round(
                          weather.daily.temperature_2m_min[index]
                        )}
                        °

                      </span>

                    </div>

                    <div className="mt-3 text-sm text-blue-600">

                      🌧️{" "}
                      {
                        weather.daily
                          .precipitation_probability_max[
                          index
                        ]
                      }
                      % rain chance

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Travel Tip */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">

              <h4 className="font-bold text-amber-900">
                ✈️ Travel Tip
              </h4>

              <p className="text-amber-800 mt-1">
                Checking the weather makes it easier to plan your
                clothing, activities, and transportation.
              </p>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}

export default Weather;
