import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

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
