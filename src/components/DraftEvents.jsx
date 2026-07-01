import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AllEventsList.css";

const DRAFT_STORAGE_KEY = "ascEventTemplatesDraft";

const formatDateRange = (start, end) => {
  if (!start && !end) return "No date set";
  const from = start ? new Date(start).toLocaleString() : "TBD";
  const to = end ? new Date(end).toLocaleString() : "TBD";
  return `${from} — ${to}`;
};

const DraftEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
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

  const deleteTemplate = (id) => {
    const remaining = events.filter((event) => event.id !== id);
    setEvents(remaining);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(remaining));
    setStatusMessage("Template deleted.");
  };

  const viewTemplate = (eventTemplate) => {
    navigate("/registration", { state: eventTemplate });
  };

  const editTemplate = (eventTemplate) => {
    localStorage.setItem("ascEventEdit", JSON.stringify(eventTemplate));
    navigate(`/?item=${encodeURIComponent("Create Event")}`);
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
        <div className="events-grid">
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
                  className="event-button"
                  onClick={() => editTemplate(event)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="event-button event-button-delete"
                  onClick={() => deleteTemplate(event.id)}
                >
                  Delete
                </button>
              </div>

              

              <div className="event-section">
                
    
              </div>

              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftEvents;
