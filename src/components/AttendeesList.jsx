import React, { useEffect, useState } from "react";
import "./AllEventsList.css";
import { useNavigate } from "react-router-dom";
import { getEvents } from "../services/eventService";

const formatDateRange = (start, end) => {
  if (!start && !end) return "No date set";

  const from = start ? new Date(start).toLocaleString() : "TBD";
  const to = end ? new Date(end).toLocaleString() : "TBD";

  return `${from} — ${to}`;
};

const AttendeesList = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Fetch events from backend
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

  // Search filter
  const filteredEvents = events.filter((event) => {
    const query = searchTerm.toLowerCase();

    return (
      event.title?.toLowerCase().includes(query) ||
      event.venue?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="all-events-list">
      {/* Header */}
      <div className="all-events-header">
        <div>
          <h1 className="all-events-title">Attendees List</h1>
          <p className="all-events-subtitle">
            Browse events and view the attendees associated with each event.
          </p>
        </div>

        <div className="all-events-stat">
          {events.length} event{events.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Search */}
      <div className="all-events-search">
        <input
          type="text"
          placeholder="Search by event name or venue"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Status */}
      {statusMessage && (
        <div className="all-events-status">{statusMessage}</div>
      )}

      {/* Event List */}
      {events.length === 0 ? (
        <div className="event-list-empty">No events found.</div>
      ) : filteredEvents.length === 0 ? (
        <div className="event-list-empty">
          No events match "{searchTerm}".
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

                  <p>
                    <b>STATUS:</b> {event.status}
                  </p>
                </div>
              </div>

              <div className="event-actions">
                <button
                  type="button"
                  className="event-button event-button-view"
                  onClick={() => {
                    localStorage.setItem(
                      "selectedEvent",
                      JSON.stringify({
                        eventId: event.id,
                        eventName: event.title,
                      })
                    );

                    navigate("/?item=Event Attendees");
                  }}
                >
                  View Attendees
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendeesList;