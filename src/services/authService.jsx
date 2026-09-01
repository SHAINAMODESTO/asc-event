import axios from "axios";

const BASE_URL = "https://api.asconlineportal.com/api-event";

// ========================================
// LOGIN
// POST /auth/login
// ========================================

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        email: email.trim(),
        password: String(password),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Login Error:",
      error.response?.data || error
    );

    throw error;
  }
};

