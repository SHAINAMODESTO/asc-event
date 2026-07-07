import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, CalendarDays } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "admin123") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("name", "Administrator");

      navigate("/");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#c30d2e] items-center justify-center text-white px-12">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-8">
            <div className="w-50 h-50 rounded-full bg-white flex items-center justify-center">
              <CalendarDays size={100} className="text-[#c30d2e]" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-6">
            ASC Event Management System
          </h1>

          <p className="text-lg leading-8 text-red-100">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias eius quibusdam ab, inventore cupiditate dolorum odit eveniet. 
            Reiciendis voluptatibus deleniti ex porro ratione architecto, aspernatur atque nisi laboriosam ipsa? Architecto?
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8">

        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">

          <div className="mb-8">

            <h2 className="text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-2">
              Sign in to continue.
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >

            <div>
              <label className="block text-sm font-semibold mb-2">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Enter username"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#c30d2e]"
              />
            </div>

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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#c30d2e]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#c30d2e] hover:bg-red-800 transition duration-300 text-white py-3 rounded-lg font-semibold"
            >
              Sign In
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};

export default Login;