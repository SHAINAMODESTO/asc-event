import React, { useEffect, useState } from "react";
import "./AllEventsList.css";

const STORAGE_KEY = "ascEventTemplates";

const formatDateRange = (start, end) => {
  if (!start && !end) return "No date set";
  const from = start ? new Date(start).toLocaleString() : "TBD";
  const to = end ? new Date(end).toLocaleString() : "TBD";
  return `${from} — ${to}`;
};

const AttendeesList = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse saved templates", error);
      }
    }
  }, []);

  const filteredEvents = events.filter((event) => {
    const query = searchTerm.toLowerCase();
    return (
      event.eventName?.toLowerCase().includes(query) ||
      event.eventVenue?.toLowerCase().includes(query)
    );
  });

  const viewAttendees = (eventTemplate) => {
    setStatusMessage(`View attendees for ${eventTemplate.eventName || "this event"}`);
  };

  return (
    <div className="all-events-list">
      <div className="all-events-header">
        <div>
          <h1 className="all-events-title">Attendees List</h1>
          <p className="all-events-subtitle">
            Browse events and view the attendees associated with each template.
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

      {statusMessage && <div className="all-events-status">{statusMessage}</div>}

      {events.length === 0 ? (
        <div className="event-list-empty">
          No saved templates yet. Save a template from Create Event and it will appear here.
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="event-list-empty">
          No templates match "{searchTerm}". Try a different search term.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <div key={event.id || index} className="all-event-card">
              <div className="event-card-header">
                <div>
                  <h2 className="event-title">{event.eventName || "Untitled Event"}</h2>
                  <p className="event-venue"><b>VENUE:</b> {event.eventVenue || "No venue set"}</p>
                  <p className="event-date"><b>DATE:</b> {formatDateRange(event.eventStart, event.eventEnd)}</p>
                </div>
              </div>

              <div className="event-actions">
                <button
                  type="button"
                  className="event-button event-button-view"
                  onClick={() => viewAttendees(event)}
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
