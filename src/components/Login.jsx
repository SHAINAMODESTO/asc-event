import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CalendarDays,
  Users,
  ShieldCheck,
} from "lucide-react";
import { loginUser, getCurrentUser } from "../services/authService";
import CompanyLogo from "../assets/asc-monogram.svg";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
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

      // FE-013: authService.jsx's loginUser already normalizes a
      // `string[]` validation-message envelope into one readable
      // string (applyErrorEnvelopeMessage in api.jsx), so this can
      // just read the message directly instead of hand-rolling its
      // own Array.isArray check.
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#e30101]">

      {/* ========================================
          LEFT PANEL
      ======================================== */}

      <div className="hidden md:flex md:w-2/5 relative overflow-hidden bg-[#e30101] text-white px-14 py-14 flex-col">

        {/* Decorative diagonal overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 35%, rgba(0,0,0,0.18) 100%)",
          }}
        />

        {/* Building skyline, blended into the red panel */}
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full h-1/3 opacity-10"
          viewBox="0 0 400 160"
          preserveAspectRatio="none"
          fill="#ffffff"
        >
          <rect x="0" y="70" width="34" height="90" />
          <rect x="38" y="40" width="26" height="120" />
          <rect x="68" y="90" width="30" height="70" />
          <rect x="102" y="20" width="22" height="140" />
          <rect x="128" y="60" width="36" height="100" />
          <polygon points="146,60 164,60 155,38" />
          <rect x="168" y="95" width="24" height="65" />
          <rect x="196" y="10" width="30" height="150" />
          <rect x="230" y="55" width="20" height="105" />
          <rect x="254" y="75" width="34" height="85" />
          <rect x="292" y="30" width="26" height="130" />
          <polygon points="292,30 318,30 305,8" />
          <rect x="322" y="85" width="30" height="75" />
          <rect x="356" y="50" width="24" height="110" />
          <rect x="382" y="95" width="18" height="65" />
        </svg>

        <div className="relative flex flex-col h-full">

          {/* LOGO */}

          <div className="flex-1 flex flex-col items-center justify-center text-center">

            <img
              src={CompanyLogo}
              alt="ASC logo"
              className="h-40 w-40 object-contain"
            />

            <div className="mt-4 h-px w-16 bg-white/40" />

            <div className="mt-4 text-5xl font-extrabold leading-tight tracking-wide">
              <div>EVENT</div>
              <div>MANAGEMENT</div>
              <div>SYSTEM</div>

              
            </div>

            <p className="mt-10 text-red-50/90 leading-7">
              The ASC Event Management System helps you
              manage events, attendees, and activities in
              one secure and easy-to-use platform.
            </p>


          </div>

          

           

          

        </div>

      </div>


      {/* ========================================
          RIGHT PANEL
      ======================================== */}

      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-gray-50 to-gray-200">

        {/* Decorative blob */}
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-96 w-96 rounded-full bg-gray-300/40 blur-3xl" />

        {/* Dot grid texture */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.15]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="login-dot-grid"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1.5" cy="1.5" r="1.5" fill="#9ca3af" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-dot-grid)" />
        </svg>

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl p-10 sm:p-14">

         

          {/* HEADER */}

          <div className="mb-10">

         
            <h1 className="text-3xl font-bold text-gray-800 text-center">
              LOGIN FORM
            </h1>
            <p className="text-black-500 mt-3 text-base leading-relaxed">
              Sign in to your Event Management System account to continue.
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

              <div className="relative">

                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email address"
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-300 pl-12 pr-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-[#e30101]"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-semibold mb-2">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 pl-12 pr-12 py-3.5 text-base outline-none focus:ring-2 focus:ring-[#e30101]"
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


            {/* REMEMBER ME + FORGOT PASSWORD */}

            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  className="h-4 w-4 rounded accent-[#e30101]"
                />

                Remember me

              </label>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setInfoMessage(
                    "Please contact your administrator to reset your password."
                  );
                }}
                className="text-[#e30101] font-semibold hover:underline"
              >
                Forgot password?
              </button>

            </div>


            {/* ========================================
                ERROR / INFO MESSAGE
            ======================================== */}

            {error && (

              <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-red-700 whitespace-pre-line">
                {error}
              </div>

            )}

            {!error && infoMessage && (

              <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm text-gray-600 whitespace-pre-line">
                {infoMessage}
              </div>

            )}


            {/* ========================================
                LOGIN BUTTON
            ======================================== */}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#e30101] hover:bg-red-800 transition duration-300 text-white py-3.5 text-base rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {loading
                ? "Signing In..."
                : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}

            </button>

          </form>


          {/* DIVIDER */}

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              or
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>


          {/* CONTACT ADMINISTRATOR */}

          <button
            type="button"
            onClick={() => {
              setError("");
              setInfoMessage(
                "For login issues, please reach out to your system administrator."
              );
            }}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3.5 text-base text-gray-600 font-medium hover:bg-gray-50 transition"
          >
            <ShieldCheck size={18} />
            Need help? Contact your administrator
          </button>

        </div>

      </div>

    </div>
  );
};

export default Login;