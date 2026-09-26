import { useState } from "react";
import axios from "axios";

function Login({ onLoginSuccess, onGoToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      console.log("Login successful:", response.data);

      // Token save
      localStorage.setItem(
        "token",
        response.data.token
      );

      // User save
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // Popup nahi hoga
      // Directly website open hogi
      if (onLoginSuccess) {
        onLoginSuccess();
      }

    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Login failed."
        );
      } else if (err.request) {
        setError(
          "Backend server se connection nahi ho raha. Check karo server port 5000 par running hai."
        );
      } else {
        setError(
          "Login failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="text-5xl mb-3">
            ✈️
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="text-slate-500 mt-2">
            Login to your Smart Travel Planner
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="mb-5">

            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

          </div>

          {/* Password */}
          <div className="mb-6">

            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* Signup Link */}
        <p className="text-center text-sm text-slate-500 mt-6">

          Don't have an account?{" "}

          <button
            type="button"
            onClick={onGoToSignup}
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign Up
          </button>

        </p>

      </div>

    </div>
  );
}

export default Login;