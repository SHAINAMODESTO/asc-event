import axios from "axios";

const BASE_URL = "https://api.asconlineportal.com/api-event";

export const createAttendee = async (attendeeData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/attendee/create`,
      attendeeData
    );

    return response.data;
  } catch (error) {
    console.error("Create attendee error:", error.response?.data || error);
    throw error;
  }
};