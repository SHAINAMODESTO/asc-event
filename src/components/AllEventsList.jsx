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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  

  useEffect(() => {
    fetchEvents();
  }, []);

const fetchEvents = async () => {
  try {
    const response = await getEvents();

    console.log("Fetched events:", response);

    const draftEvents = response.filter(
      (event) => event.status?.toLowerCase().includes("draft")
    );

    setEvents(draftEvents);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    console.log(response[0]);
  }
};
const handlePublish = async (event) => {
  const confirmed = window.confirm(
    `Are you sure you want to publish ${event.title}Event?`
  );

  if (!confirmed) return;

  try {
    const response = await publishEvent(event.id);

    if (response.success || response.data) {
      alert("Event published successfully.");

      fetchEvents();

      window.open(
        `/registration/${event.id}`,
        "_blank"
      );
      navigate("/published-events");

navigate("/published-events");
    }
  } catch (error) {
    console.error("Publish failed:", error);

    setStatusMessage(
      error.response?.data?.message || "Failed to publish event."
    );
  }
};
  // Search + Date Range Filter
  const filteredEvents = events.filter((event) => {
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      event.title?.toLowerCase().includes(query) ||
      event.venue?.toLowerCase().includes(query);

    const eventStart = new Date(event.startDate);

    const matchesFromDate = fromDate
      ? eventStart >= new Date(fromDate)
      : true;

    const matchesToDate = toDate
      ? eventStart <= new Date(toDate)
      : true;

    return matchesSearch && matchesFromDate && matchesToDate;
  });

  const deleteTemplate = async (id) => {
  try {
    const response = await deleteEvent(id);

    if (response.success) {
      fetchEvents();
      setStatusMessage("Event deleted successfully.");
    }
  } catch (error) {
    console.error("Delete failed:", error);
    setStatusMessage(
      error.response?.data?.message || "Failed to delete event."
    );
  }
};

  const viewTemplate = (eventTemplate) => {
    navigate("/registration", { state: eventTemplate });
  };

  /*const editTemplate = (eventTemplate) => {
    navigate("/create-event", {
      state: eventTemplate,
    });
  };*/
  const editTemplate = (eventTemplate) => {
  console.log("Edit Event:", eventTemplate);

  navigate("/create-event", {
    state: eventTemplate,
  });
};


  return (
    <div className="all-events-list">
      <div className="all-events-header">
        <div>
          <h1 className="all-events-title">Draft Events List</h1>
        </div>

        <div className="all-events-stat">
          {events.length} saved event{events.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Search + Date Range */}
      <div className="all-events-search">
  <input
    type="text"
    placeholder="Search by event name or venue"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-input"
  />

  <div className="date-range-wrapper">
    <label className="date-range-label">Date Range:</label>

    <span className="date-text">From</span>
    <input
      type="date"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      className="date-input"
    />

    <span className="date-text">To</span>
    <input
      type="date"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      className="date-input"
    />
  </div>
</div>

      {statusMessage && (
        <div className="all-events-status">{statusMessage}</div>
      )}

      {events.length === 0 ? (
        <div className="event-list-empty">No saved templates yet.</div>
      ) : filteredEvents.length === 0 ? (
        <div className="event-list-empty">
          No templates match your filters.
        </div>
      ) : (
        <div className="events-grid">
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
                  className="event-button event-button-publish"
                  onClick={() => handlePublish(event)}
                >
                  Publish Form 
                </button>

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