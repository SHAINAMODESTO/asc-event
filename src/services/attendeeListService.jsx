import axios from "axios";

 const BASE_URL = "https://api.asconlineportal.com/api-event";
//const BASE_URL = "http://localhost:3021/api-event";

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
      error.response?.data || error.message
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
