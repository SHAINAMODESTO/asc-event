import axios from "axios";
import api, { applyRateLimitMessage, applyErrorEnvelopeMessage } from "./api";

const BASE_URL = "https://api.asconlineportal.com/api-event";

// ========================================
// LOGIN
// POST /auth/login
// ========================================
// Uses raw `axios`, not the shared `api` instance, since there's no
// access token yet to attach before login succeeds — which also means
// it doesn't go through api.jsx's response interceptor. FE-012: the
// backend caps login attempts tighter than everything else (5/min),
// so this is exactly the endpoint most likely to get rate-limited —
// `applyRateLimitMessage` re-runs the same 429 handling here so
// Login.jsx's existing `error.response?.data?.message` read still
// shows a "try again in Ns" message instead of the generic fallback.

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
    applyErrorEnvelopeMessage(error);
    applyRateLimitMessage(error);

    console.error(
      "Login Error:",
      error.response?.data || error
    );

    throw error;
  }
};

// ========================================
// GET CURRENT USER (ROLE)
// GET /auth/me
// ========================================
// The login response above doesn't include the user's role — call
// this once right after login (see Login.jsx) to find out whether the
// current session is ADMIN or COORDINATOR, sourced from the API
// rather than guessed from the username. Uses the shared `api`
// instance (not raw axios) so the just-saved access token is
// automatically attached via its request interceptor.

export const getCurrentUser = async () => {
  try {
    const response = await api.get(`${BASE_URL}/auth/me`);

    return response.data;
  } catch (error) {
    console.error(
      "Get Current User Error:",
      error.response?.data || error
    );

    throw error;
  }
};

// ========================================
// STORED ROLE HELPERS
// ========================================
// Small accessors around the "role" localStorage entry that
// getCurrentUser's result gets saved to (see Login.jsx). Kept here
// alongside the call that populates it so callers don't need to know
// the storage key or shape.

export const getStoredRole = () => localStorage.getItem("role") || "";

export const isAdmin = () => getStoredRole().toUpperCase() === "ADMIN";

export const isCoordinator = () =>
  getStoredRole().toUpperCase() === "COORDINATOR";