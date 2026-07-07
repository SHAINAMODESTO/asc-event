import axios from "axios";

//  const BASE_URL = "https://api.asconlineportal.com/api-event";
const BASE_URL = "http://localhost:3021/api-event";

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
// Asign table number to attendee
export const assignTable = async (attendeeId, tableNumber) => {
  const response = await axios.patch(
    `${BASE_URL}/attendee/${attendeeId}/table`,
    {
      tableNumber,
    },
  );

  return response.data;
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
