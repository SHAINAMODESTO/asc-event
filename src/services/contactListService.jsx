import axios from "axios";

// const BASE_URL = "https://api.asconlineportal.com/api-event";
const BASE_URL = "http://localhost:3021/api-event";

// Create attendee
export const createContact = async (attendeeData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/contacts/create`,
      attendeeData,
    );

    return response.data;
  } catch (error) {
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
    console.error("Get contacts error:", error.response?.data || error);
    throw error;
  }
};
