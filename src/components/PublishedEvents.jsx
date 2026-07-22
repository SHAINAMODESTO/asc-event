import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, NotebookTabs } from "lucide-react";

import { getEvents, deleteEvent } from "../services/eventService";
import "./AllEventsList.css";

const formatDateRange = (start, end) => {
  if (!start && !end) return "No date set";

  const from = start ? new Date(start).toLocaleString() : "TBD";
  const to = end ? new Date(end).toLocaleString() : "TBD";

  return `${from} — ${to}`;
};

const PublishedEvents = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

const [showUrlModal, setShowUrlModal] = useState(false);
const [generatedUrl, setGeneratedUrl] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await getEvents();

      console.log("Fetched published events:", response);

      const publishedEvents = response.filter(
        (event) => event.status?.toLowerCase().includes("published")
      );

      setEvents(publishedEvents);
    } catch (error) {
      console.error("Failed to fetch published events:", error);
    }
  };
   const viewAttendees = (event) => {
  navigate(`/attendees/${event.id}`);
}; 

  // Search + Date Filter
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
        setStatusMessage("Published event deleted successfully.");
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

  const generateEventURL = (event) => {
  const url = `${window.location.origin}/registration/${event.id}`;

  setGeneratedUrl(url);
  setShowUrlModal(true);
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedUrl);
    alert("Registration URL copied!");
  } catch (error) {
    console.error(error);
    alert("Failed to copy.");
  }
};

  return (
    <div className="all-events-list">
      <div className="all-events-header">
        <div className="header-title">
          <div className="stat-icon blue">
                    <NotebookTabs size={24}/>
          </div>
          <div>
            <h1 className="all-events-title"> Published Events List</h1>
          </div>
        </div>
        <div className="all-events-stat">
          {events.length} published event{events.length === 1 ? "" : "s"}
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
        <div className="event-list-empty">No published events yet.</div>
      ) : filteredEvents.length === 0 ? (
        <div className="event-list-empty">
          No published events match your filters.
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
                  onClick={() => viewAttendees(event)}
                >
                  Attendees
                </button>
                <button
                  type="button"
                  className="generate-url-button"
                  onClick={() => generateEventURL(event)}
                >
                  Generate URL
                </button>

                <button
                  type="button"
                  className="event-button event-button-delete"
                  onClick={() => deleteTemplate(event.id)}
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showUrlModal && (
  <div
    className="modal-overlay"
    onClick={() => setShowUrlModal(false)}
  >
    <div
      className="modal-box"
      onClick={(e) => e.stopPropagation()}
    >
      <h2>Registration Link</h2>

      <p>
        Share this link with attendees to register for the event.
      </p>

      <div className="url-container">
        <input
          type="text"
          value={generatedUrl}
          readOnly
          className="url-input"
        />

        <button
          className="copy-btn"
          onClick={copyToClipboard}
        >
          <Copy size={18} />
        </button>
      </div>

      <button
        className="close-modal-btn"
        onClick={() => setShowUrlModal(false)}
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default PublishedEvents;