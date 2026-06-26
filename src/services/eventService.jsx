import axios from "axios";

const BASE_URL = "https://api.asconlineportal.com/api-event";

// Create Event
export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/event/create`,
      eventData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Create Event Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Publish Event
export const publishEvent = async (eventId) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/event/${eventId}/publish`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Publish Event Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get All Events
export const getEvents = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/event`);

    return response.data;
  } catch (error) {
    console.error(
      "Get Events Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get Single Event
export const getEventById = async (eventId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/event/${eventId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get Event Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Delete Event
export const deleteEvent = async (eventId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/event/${eventId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete Event Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};