import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getEvents,
  publishEvent,
  deleteEvent,
} from "../services/eventService";
import "./AllEventsList.css";

const formatDateRange = (start, end) => {
  if (!start && !end) return "No date set";

  const from = start ? new Date(start).toLocaleString() : "TBD";
  const to = end ? new Date(end).toLocaleString() : "TBD";

  return `${from} — ${to}`;
};

const AllEventsList = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Fetch all events from backend
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await getEvents();

      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  // Filter search
  const filteredEvents = events.filter((event) => {
    const query = searchTerm.toLowerCase();

    return (
      event.title?.toLowerCase().includes(query) ||
      event.venue?.toLowerCase().includes(query)
    );
  });

  // Delete event (frontend only for now)
 const deleteTemplate = async (id) => {
  try {
    const response = await deleteEvent(id);

    if (response.success) {
      // Refresh backend event list
      fetchEvents();

      // Also remove from localStorage (for AttendeesList)
      const stored = localStorage.getItem("ascEventTemplates");

      if (stored) {
        const parsed = JSON.parse(stored);

        const updatedTemplates = parsed.filter(
          (template) => template.eventId !== id
        );

        localStorage.setItem(
          "ascEventTemplates",
          JSON.stringify(updatedTemplates)
        );
      }

      setStatusMessage("Event deleted successfully.");
    }
  } catch (error) {
    console.error("Delete failed:", error);
    setStatusMessage(
      error.response?.data?.message || "Failed to delete event."
    );
  }
};
  // View event
  const viewTemplate = (eventTemplate) => {
    navigate("/registration", { state: eventTemplate });
  };

  // Edit event
  const editTemplate = (eventTemplate) => {
    localStorage.setItem("ascEventEdit", JSON.stringify(eventTemplate));
    navigate(`/?item=${encodeURIComponent("Create Event")}`);
  };

  // Publish event
  const handlePublish = async (id) => {
    try {
      const response = await publishEvent(id);

      if (response.success) {
        setStatusMessage("Event published successfully.");
        fetchEvents(); // refresh event list
      }
    } catch (error) {
      console.error(error.response?.data);
      setStatusMessage(
        error.response?.data?.message || "Failed to publish event."
      );
    }
  };

  return (
    <div className="all-events-list">
      <div className="all-events-header">
        <div>
          <h1 className="all-events-title">All Events List</h1>
          <p className="all-events-subtitle">
            Review saved templates and open them for reference.
          </p>
        </div>

        <div className="all-events-stat">
          {events.length} saved event{events.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="all-events-search">
        <input
          type="text"
          placeholder="Search by event name or venue"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {statusMessage && (
        <div className="all-events-status">{statusMessage}</div>
      )}

      {events.length === 0 ? (
        <div className="event-list-empty">No saved templates yet.</div>
      ) : filteredEvents.length === 0 ? (
        <div className="event-list-empty">
          No templates match "{searchTerm}".
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <div key={event.id || index} className="all-event-card">
              <div className="event-card-header">
                <div>
                  <h2 className="event-title">
                    {event.title || "Untitled Event"}
                  </h2>

                  <p className="event-venue">
                    <b>VENUE:</b> {event.venue || "No venue set"}
                  </p>

                  <p className="event-date">
                    <b>DATE:</b>{" "}
                    {formatDateRange(event.startDate, event.endDate)}
                  </p>

                  {/* Status */}
                  <p>
                    <b>STATUS:</b> {event.status}
                  </p>
                </div>
              </div>

              <div className="event-actions">

                {/* Edit */}
                <button
                  type="button"
                  className="event-button"
                  onClick={() => editTemplate(event)}
                >
                  Edit
                </button>

                {/* Generate URL */}
                <button
                  type="button"
                  className="event-button"
                  onClick={() => viewTemplate(event)}
                >
                  Generate URL
                </button>

                {/* Delete */}
                <button
                  type="button"
                  className="event-button event-button-delete"
                  onClick={() => deleteTemplate(event.id)}
                >
                  Delete
                </button>
              </div>

              <div className="event-section"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllEventsList;