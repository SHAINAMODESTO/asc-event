import api from "./api";
// const BASE_URL = "https://api.asconlineportal.com/api-event";
// const BASE_URL = "http://localhost:3021/api-event";
const BASE_URL = import.meta.env.VITE_API_URL;
// Create Event
export const createEvent = async (eventData) => {
  try {
    const response = await api.post(`${BASE_URL}/event/create`, eventData);

    return response.data;
  } catch (error) {
    console.error("Create Event Error:", error.response?.data || error.message);
    throw error;
  }
};

// Publish Event
export const publishEvent = async (eventId) => {
  try {
    const response = await api.patch(`${BASE_URL}/event/${eventId}/publish`);

    return response.data;
  } catch (error) {
    console.error(
      "Publish Event Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
// Get All Events
export const getEvents = async () => {
  try {
    const response = await api.get(`${BASE_URL}/event`);

    return response.data.data;
  } catch (error) {
    console.error("Get Events Error:", error.response?.data || error.message);
    throw error;
  }
};

// Get Single Event
export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`${BASE_URL}/event/${eventId}`);

    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Get Event Error:", error.response?.data || error.message);
    throw error;
  }
};
//Edit Event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(
      `${BASE_URL}/event/update/${eventId}`,
      eventData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Update Event Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// Delete Event
export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`${BASE_URL}/event/${eventId}`);

    return response.data;
  } catch (error) {
    console.error("Delete Event Error:", error.response?.data || error.message);
    throw error;
  }
};

// ========================================
// BLOCKED EMAILS (per event)
// ========================================
// Lets an admin block a specific email address from registering for a
// given event, and view the current block list.
//
// NOTE: unlike the rest of this file (which uses the singular `/event/...`
// prefix), these paths use the plural `/events/...` because that's what
// the FE-008 issue specifies verbatim, and the singular form 404'd
// ("Cannot GET /api-event/event/:eventId/blocked-emails") against the
// live backend. If this route ever moves, this is the one place to
// change it.

// Get Blocked Emails for an Event
export const getBlockedEmails = async (eventId) => {
  try {
    const response = await api.get(
      `${BASE_URL}/events/${eventId}/blocked-emails`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get Blocked Emails Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Add a Blocked Email to an Event
export const addBlockedEmail = async (eventId, email) => {
  try {
    const response = await api.post(
      `${BASE_URL}/events/${eventId}/blocked-emails`,
      { email }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Add Blocked Email Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Remove a Blocked Email from an Event
// NOTE: FE-008 only specifies POST/GET endpoints, not a delete/unblock
// endpoint. This assumes a REST-conventional
// `DELETE /events/:eventId/blocked-emails/:blockedEmailId`. `blockedEmailId`
// is whatever unique identifier the GET response provides per entry
// (falls back to the raw email address if the backend doesn't return a
// separate id) — confirm this against the real API once it's reachable,
// and adjust if the backend expects something different (e.g. the email
// in the request body instead of the path, or a different path shape
// entirely, same as GET/POST above needed correcting).
export const removeBlockedEmail = async (eventId, blockedEmailId) => {
  try {
    const response = await api.delete(
      `${BASE_URL}/events/${eventId}/blocked-emails/${encodeURIComponent(
        blockedEmailId
      )}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Remove Blocked Email Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};