import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
// Create attendee
export const createAttendee = async (attendeeData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/attendee/create`,
      attendeeData,
    );

    return response.data;
  } catch (error) {
    console.error("Create attendee error:", error.response?.data || error);
    throw error;
  }
};
// Assign Table Number
export const assignTable = async (attendeeId, tableNumber) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/attendee/${attendeeId}/assign-table`,
      {
        tableNumber,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Assign Table Error:",
      error.response?.data || error
    );
    throw error;
  }
};
//Check in 
export const checkInAttendee = async (attendeeId) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/attendee/${attendeeId}/check-in`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Check In Error:",
      error.response?.data || error
    );
    throw error;
  }
};

// Get attendees with pagination, search, filter
export const getAttendees = async ({
  eventId,
  page = 1,
  limit = 10,
  search = "",
  status = "",
}) => {
  try {
    const response = await axios.get(`${BASE_URL}/attendee`, {
      params: {
        page,
        limit,
        search,
        eventId,
        status,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Get attendees error:", error.response?.data || error);
    throw error;
  }
};
