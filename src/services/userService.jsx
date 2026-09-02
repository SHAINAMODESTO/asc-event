
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// ========================================
// Helper: Authorization Header
// ========================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// ========================================
// CREATE USER
// POST /users
// Admin only
// ========================================

export const createUser = async (userData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/users`,
      userData,
      getAuthHeaders()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Create User Error:",
      error.response?.data || error
    );

    throw error;
  }
};

// ========================================
// GET USERS
// GET /users
// Admin only
// ========================================

export const getUsers = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/users`,
      getAuthHeaders()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get Users Error:",
      error.response?.data || error
    );

    throw error;
  }
};

