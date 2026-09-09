import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, CalendarDays } from "lucide-react";
import { loginUser, getCurrentUser } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    // ========================================
    // VALIDATION
    // ========================================

    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      // ========================================
      // LOGIN API
      // ========================================

      const response = await loginUser(
        email,
        password
      );

      // Commented out — this prints the full login response (id,
      // email, name, and the access token itself) to the console on
      // every login. 
      // ========================================
      // BACKEND RESPONSE
      //
      // {
      //   success: true,
      //   message: "Login successful.",
      //   data: {
      //     accessToken: "...",
      //     user: {
      //       id: "...",
      //       email: "...",
      //       name: "Administrator"
      //     }
      //   }
      // }
      //
      
      // ========================================

      if (!response || !response.data) {
        setError("Login failed. Invalid server response.");
        return;
      }

      const { accessToken, user } = response.data;

      // ========================================
      // CHECK ACCESS TOKEN
      // ========================================

      if (!accessToken) {
        setError("Login failed. No access token was returned.");
        return;
      }

      // ========================================
      // SAVE ACCESS TOKEN
      // ========================================

      localStorage.setItem(
        "accessToken",
        accessToken
      );

      // ========================================
      // SAVE USER INFORMATION
      // ========================================

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );

        // Save user's name for compatibility
        // with other parts of the application
        localStorage.setItem(
          "name",
          user.name || ""
        );
      }

      // ========================================
      // FETCH + SAVE CURRENT USER'S ROLE
      // ========================================
     
      try {
        const meResponse = await getCurrentUser();

        // Commented out — same reason as the login response logs
        // ========================================
        // console.log("Current User (/auth/me) Response:", meResponse);
        // { id, email, role } response, or one wrapped in
        // { data: { id, email, role } } like the login response above.
        const me =
          meResponse?.role
            ? meResponse
            : meResponse?.data?.role
              ? meResponse.data
              : meResponse?.data || meResponse;

        if (me?.role) {
          localStorage.setItem("role", me.role);
        }
      } catch (meError) {
        console.error(
          "Failed to fetch current user role:",
          meError.response?.data || meError
        );
      }

      // ========================================
      // SAVE LOGIN STATUS
      // ========================================

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // ========================================
      // REDIRECT TO DASHBOARD
      // ========================================

      navigate("/");

    } catch (error) {
      console.error(
        "Failed to login:",
        error
      );

      const message =
        error.response?.data?.message;

      if (Array.isArray(message)) {
        setError(message.join("\n"));
      } else {
        setError(
          message || "Login failed. Please check your email and password."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* ========================================
          LEFT PANEL
      ======================================== */}

      <div className="hidden lg:flex lg:w-2/5 bg-[#c30d2e] items-center justify-center text-white px-12">

        <div className="max-w-md text-center">

          {/* ICON */}

          <div className="flex justify-center mb-8">

            <div className="w-50 h-50 rounded-full bg-white flex items-center justify-center">

              <CalendarDays
                size={100}
                className="text-[#c30d2e]"
              />

            </div>

          </div>

          {/* TITLE */}

          <h1 className="text-3xl font-bold mb-6">
            ASC Event Management System
          </h1>

          {/* DESCRIPTION */}

          <p className="text-lg leading-8 text-red-100">
            Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Molestias eius quibusdam
            ab, inventore cupiditate dolorum odit
            eveniet. Reiciendis voluptatibus deleniti
            ex porro ratione architecto, aspernatur
            atque nisi laboriosam ipsa? Architecto?
          </p>

        </div>

      </div>


      {/* ========================================
          RIGHT PANEL
      ======================================== */}

      <div className="flex-1 flex items-center justify-center p-8">

        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">

          {/* HEADER */}

          <div className="mb-8">

            <h2 className="text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-2">
              Sign in to continue.
            </p>

          </div>


          {/* ========================================
              LOGIN FORM
          ======================================== */}

          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-semibold mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter email address"
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#c30d2e]"
              />

            </div>


            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-semibold mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#c30d2e]"
                />

                {/* SHOW / HIDE PASSWORD */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}

                </button>

              </div>

            </div>


            {/* ========================================
                ERROR MESSAGE
            ======================================== */}

            {error && (

              <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-red-700 whitespace-pre-line">
                {error}
              </div>

            )}


            {/* ========================================
                LOGIN BUTTON
            ======================================== */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c30d2e] hover:bg-red-800 transition duration-300 text-white py-3 rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {loading
                ? "Signing In..."
                : "Sign In"}

            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Login;