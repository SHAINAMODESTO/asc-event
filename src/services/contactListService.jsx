import axios from "axios";
import { applyRateLimitMessage, applyErrorEnvelopeMessage } from "./api";

const BASE_URL = import.meta.env.VITE_API_URL;

// Create attendee
// FE-012: uses raw `axios` (not the shared `api` instance), so it
// doesn't go through api.jsx's response interceptor. `applyRateLimitMessage`
// re-runs the same 429 handling here so a rate-limited request still
// surfaces a "try again in Ns" message instead of a generic failure.
export const createContact = async (attendeeData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/contacts/create`,
      attendeeData,
    );

    return response.data;
  } catch (error) {
    applyErrorEnvelopeMessage(error);
    applyRateLimitMessage(error);

    console.error("Create attendee error:", error.response?.data || error);
    throw error;
  }
};

// Get contacts with pagination, search, filter
export const getContacts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/contacts/all`);

    return response.data;
  } catch (error) {
    applyErrorEnvelopeMessage(error);
    applyRateLimitMessage(error);

    console.error("Get contacts error:", error.response?.data || error);
    throw error;
  }
};