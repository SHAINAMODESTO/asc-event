import api, {
  applyRateLimitMessage,
  applyErrorEnvelopeMessage,
  handleUnauthorizedResponse,
} from "./api";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
// Create attendee
export const createAttendee = async (attendeeData) => {
  try {
    const response = await api.post(
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
   console.log("PATCH URL:");
  console.log(`${BASE_URL}/attendee/${attendeeId}/assign-table`);
  try {
    const response = await api.patch(
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
//Bulk Assign Table Number for Primary Attendees with Companions

export const bulkAssignTable = async (attendeeId, tableNumber) => {
  try {
    const response = await api.patch(
      `${BASE_URL}/attendee/${attendeeId}/bulk/assign-table`,
      {
        tableNumber,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Bulk Assign Table Error:",
      error.response?.data || error
    );
    throw error;
  }
};
//Check in
export const checkInAttendee = async (attendeeId) => {
  try {

    const response = await api.patch(
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
// Get attendee by ID
export const getAttendeeById = async (attendeeId) => {
  try {
    const response = await api.get(
      `${BASE_URL}/attendee/${attendeeId}`
    );
    console.log("Attendee API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Get attendee error:",
      error.response?.data || error
    );
    throw error;
  }
};
// Register attendee with companions
export const createAttendeeWithCompanions = async (data) => {
  try {
    const response = await api.post(
      `${BASE_URL}/attendee/create`,
      data
    );

    return response.data;
  } catch (error) {
    console.error("Create attendee failed:", error);

    throw (
      error.response?.data || {
        message: "Unable to register attendee.",
      }
    );
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
    const response = await api.get(`${BASE_URL}/attendee`, {
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
// Dashboard Summary
export const getDashboardSummary = async (eventId) => {
  try {
    const response = await api.get(
      `${BASE_URL}/attendee/summary/${eventId}`
      // `${BASE_URL}/events/${eventId}/dashboard`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error.response?.data || error
    );
    throw error;
  }
};
// Create Companion
export const createCompanion = async (primaryId, companionData) => {
  try {
    const response = await api.post(
      `${BASE_URL}/attendee/${primaryId}/companion`,
      companionData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Create Companion Error:",
      error.response?.data || error
    );
    throw error;
  }
};
// Update Companion
export const updateCompanions = async (
  primaryId,
  companionId,
  companionData
) => {
  try {
    const response = await api.patch(
      `${BASE_URL}/attendee/${primaryId}/companions/${companionId}`,
      companionData
    );

    return response;

  } catch (error) {
    console.error("Update Companion Error:");
    console.error(error.response);

    throw error;
  }
};

// UPDATE PRIMARY ATTENDEE


export const updatePrimaryAttendee = async (attendeeId, attendeeData) => {
  try {
    const response = await api.patch(
      `${BASE_URL}/attendee/${attendeeId}`,
      attendeeData
    );

    console.log("========== UPDATE ATTENDEE ==========");
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Update Attendee Error:",
      error.response?.data || error
    );

    throw error;
  }
};
// ========================================
// BULK CHECK IN ATTENDEES
// ========================================

export const bulkCheckInAttendees = async (attendeeIds) => {
  try {
    const response = await api.patch(
      `${BASE_URL}/attendee/check-in`,
      {
        attendeeIds,
      }
    );

    console.log("========== BULK CHECK IN ==========");
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Bulk Check In Error:",
      error.response?.data || error
    );

    throw error;
  }
};

// ========================================
// SCAN ATTENDEE BY QR CODE
// ========================================

export const scanAttendee = async (eventId, attendeeCode) => {
  try {
    const response = await api.get(
      `${BASE_URL}/attendee/event/${eventId}/scan/${encodeURIComponent(attendeeCode)}`
    );

    console.log("Scan Attendee Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Scan Attendee Error:",
      error.response?.data || error
    );

    throw error;
  }
};
// ========================================
//  GRENERATE ATTENDEE EVENT REPORT
// ======================================

export const generateAttendeeReport = async (eventId) => {
    try {
        const response = await api.get(
            `${BASE_URL}/attendee/event/${eventId}/report`,
            {
                responseType: "blob",
            }
        );

        console.log(
            "========== GENERATE ATTENDEE REPORT =========="
        );
        console.log("Event ID:", eventId);
        console.log("Report response:", response);

        return response;

    } catch (error) {
        console.error(
            "Generate Attendee Report Error:",
            error.response?.data || error
        );

        throw error;
    }
};


// Confirm attendee
export const confirmAttendee = async (attendeeId) => {
  try {
    const response = await api.patch(
      `/attendee/${attendeeId}/confirm`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Confirm Attendee Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// Decline attendee
export const declineAttendee = async (attendeeId) => {
  try {
    const response = await api.patch(
      `/attendee/${attendeeId}/decline`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Decline Attendee Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// Cancel attendee
export const cancelAttendee = async (attendeeId) => {
  try {
    const response = await api.patch(
      `/attendee/${attendeeId}/cancel`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Cancel Attendee Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};
//Bulk Confirm Attendees
export const bulkConfirmAttendees = async (attendeeIds) => {
  try {
    const response = await api.patch("/attendee/bulk-confirm", {
      attendeeIds,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Bulk Confirm Attendees Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// ========================================
// BULK CREATE ATTENDEES
// POST /attendee/:id/bulk-create
// Admin only
// multipart/form-data
// ========================================
// Uses raw `axios` (not the shared `api` instance) since it attaches
// its own multipart headers, so it doesn't go through api.jsx's
// response interceptor. FE-012: `applyRateLimitMessage` re-runs the
// same 429 handling here so a rate-limited import still surfaces a
// "try again in Ns" message instead of a generic failure. FE-003:
// `handleUnauthorizedResponse` re-runs the same expired-token cleanup
// + redirect here too, since this call is invisible to the
// interceptor.

export const bulkCreateAttendees = async (eventId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("accessToken");

    const response = await axios.post(
      `${BASE_URL}/attendee/${eventId}/bulk-create`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    applyErrorEnvelopeMessage(error);
    applyRateLimitMessage(error);
    handleUnauthorizedResponse(error);

    console.error(
      "Bulk Create Attendees Error:",
      error.response?.data || error
    );

    throw error;
  }
};

// ========================================
// GIVEAWAY DISTRIBUTION
// ========================================

// Mark loot bag as distributed
export const distributeLootBag = async (attendeeId) => {
  try {
    const response = await api.patch(
      `${BASE_URL}/attendee/${attendeeId}/loot-bag`
    );

    console.log("========== LOOT BAG DISTRIBUTED ==========");
    console.log("Attendee ID:", attendeeId);
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Distribute Loot Bag Error:",
      error.response?.data || error
    );

    throw error;
  }
};

// Mark souvenir as distributed
export const distributeSouvenir = async (attendeeId) => {
  try {
    const response = await api.patch(
      `${BASE_URL}/attendee/${attendeeId}/souvenir`
    );

    console.log("========== SOUVENIR DISTRIBUTED ==========");
    console.log("Attendee ID:", attendeeId);
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Distribute Souvenir Error:",
      error.response?.data || error
    );

    throw error;
  }
};

// Mark door prize as distributed
export const distributeDoorPrize = async (attendeeId) => {
  try {
    const response = await api.patch(
      `${BASE_URL}/attendee/${attendeeId}/door-prize`
    );

    console.log("========== DOOR PRIZE DISTRIBUTED ==========");
    console.log("Attendee ID:", attendeeId);
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Distribute Door Prize Error:",
      error.response?.data || error
    );

    throw error;
  }
};