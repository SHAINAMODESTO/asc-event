import React, { useEffect, useState } from "react";
import { Archive, RotateCcw } from "lucide-react";

import { getArchivedEvents, restoreEvent } from "../services/eventService";
import "./AllEventsList.css";

const formatDateRange = (start, end) => {
  if (!start && !end) return "No date set";

  const from = start ? new Date(start).toLocaleString() : "TBD";
  const to = end ? new Date(end).toLocaleString() : "TBD";

  return `${from} — ${to}`;
};

const ArchivedEvents = () => {
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    fetchArchivedEvents();
  }, []);

  const fetchArchivedEvents = async () => {
    try {
      const response = await getArchivedEvents();

      console.log("Fetched archived events:", response);

      setArchivedEvents(response || []);
    } catch (error) {
      console.error("Failed to fetch archived events:", error);
    }
  };

  const restoreTemplate = async (event) => {
    const confirmed = window.confirm(
      `Restore "${event.title}"? It will move back to the Published Events list.`
    );

    if (!confirmed) return;

    try {
      const response = await restoreEvent(event.id);

      if (response.success) {
        setStatusMessage("Event restored successfully.");
        fetchArchivedEvents();
      }
    } catch (error) {
      console.error("Restore failed:", error);
      setStatusMessage(
        error.response?.data?.message || "Failed to restore event."
      );
    }
  };

  const filteredArchivedEvents = archivedEvents.filter((event) => {
    const query = searchTerm.toLowerCase();

    return (
      event.title?.toLowerCase().includes(query) ||
      event.venue?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="all-events-list">
      <div className="all-events-header">
        <div className="header-title">
          <div className="stat-icon blue">
            <Archive size={24} />
          </div>
          <div>
            <h1 className="all-events-title">Archived Events List</h1>
          </div>
        </div>
        <div className="all-events-stat">
          {archivedEvents.length} archived event
          {archivedEvents.length === 1 ? "" : "s"}
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

      {archivedEvents.length === 0 ? (
        <div className="event-list-empty">No archived events yet.</div>
      ) : filteredArchivedEvents.length === 0 ? (
        <div className="event-list-empty">
          No archived events match your search.
        </div>
      ) : (
        <div className="events-grid">
          {filteredArchivedEvents.map((event, index) => (
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

                  <p className="event-date">
                    <b>ARCHIVED:</b>{" "}
                    {event.deletedAt
                      ? new Date(event.deletedAt).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="event-actions">
                <button
                  type="button"
                  className="event-button event-button-view"
                  onClick={() => restoreTemplate(event)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <RotateCcw size={16} />
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedEvents;
