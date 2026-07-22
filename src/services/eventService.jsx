import axios from "axios";
// const BASE_URL = "https://api.asconlineportal.com/api-event";
// const BASE_URL = "http://localhost:3021/api-event";
const BASE_URL = import.meta.env.VITE_API_URL;
// Create Event
export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(`${BASE_URL}/event/create`, eventData);

    return response.data;
  } catch (error) {
    console.error("Create Event Error:", error.response?.data || error.message);
    throw error;
  }
};

// Publish Event
export const publishEvent = async (eventId) => {
  try {
    const response = await axios.patch(`${BASE_URL}/event/${eventId}/publish`);

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
    const response = await axios.get(`${BASE_URL}/event`);

    return response.data.data;
  } catch (error) {
    console.error("Get Events Error:", error.response?.data || error.message);
    throw error;
  }
};

// Get Single Event
export const getEventById = async (eventId) => {
  try {
    const response = await axios.get(`${BASE_URL}/event/${eventId}`);

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
    const response = await axios.put(
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
    const response = await axios.delete(`${BASE_URL}/event/${eventId}`);

    return response.data;
  } catch (error) {
    console.error("Delete Event Error:", error.response?.data || error.message);
    throw error;
  }
};
