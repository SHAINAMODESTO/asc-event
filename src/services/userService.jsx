import axios from "axios";
import {
  applyRateLimitMessage,
  applyErrorEnvelopeMessage,
  handleUnauthorizedResponse,
} from "./api";

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
// Uses raw `axios` (not the shared `api` instance), so it doesn't go
// through api.jsx's response interceptor. FE-012: `applyRateLimitMessage`
// re-runs the same 429 handling here so a rate-limited request still
// surfaces a "try again in Ns" message instead of a generic failure.
// FE-003: `handleUnauthorizedResponse` re-runs the same expired-token
// cleanup + redirect here too, since this call is invisible to the
// interceptor.

export const createUser = async (userData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/users`,
      userData,
      getAuthHeaders()
    );

    return response.data;
  } catch (error) {
    applyErrorEnvelopeMessage(error);
    applyRateLimitMessage(error);
    handleUnauthorizedResponse(error);

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
    applyErrorEnvelopeMessage(error);
    applyRateLimitMessage(error);
    handleUnauthorizedResponse(error);

    console.error(
      "Get Users Error:",
      error.response?.data || error
    );

    throw error;
  }
};