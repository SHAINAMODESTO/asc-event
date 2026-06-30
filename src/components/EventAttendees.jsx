import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAttendees } from "../services/attendeeListService";
import "./EventAttendees.css";

const EventAttendees = () => {
  const navigate = useNavigate();
  const printRef = useRef();

  // Get selected event from localStorage
  const selectedEvent = JSON.parse(
    localStorage.getItem("selectedEvent")
  );

  const eventId = selectedEvent?.eventId;
  const eventName = selectedEvent?.eventName || "Event";

  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  // Filter
  const [status, setStatus] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Print only header + table
  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;

    window.location.reload();
  };

  const fetchAttendees = async () => {
    if (!eventId) {
      console.log("No eventId found");
      return;
    }

    try {
      setLoading(true);

      const response = await getAttendees({
        eventId,
        page,
        limit,
        search,
        status,
      });

      console.log("API Response:", response);

      setAttendees(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error("Fetch attendees error:", error);
      alert("Failed to load attendees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [page, search, status]);

  // Export CSV
  const handleExport = () => {
    const csvRows = [
      [
        "First Name",
        "Last Name",
        "Preferred Name",
        "Email",
        "Company",
        "Position",
        "Status",
        "Created Date",
      ],
      ...attendees.map((attendee) => [
        attendee.firstName || "",
        attendee.lastName || "",
        attendee.preferredNameOnBadge || "",
        attendee.emailAddress || "",
        attendee.company || "",
        attendee.position || "",
        attendee.status || "",
        attendee.createdAt
          ? new Date(attendee.createdAt).toLocaleString()
          : "",
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${eventName}-attendees.csv`;
    link.click();
  };

  return (
    <div className="event-attendees-page">
         {/* Header */}
        <div className="attendees-header">
          <h1>{eventName} Attendees</h1>
          <p>{attendees.length} attendee(s)</p>
        </div>
      {/* Search + Filter */}
      <div className="attendees-controls">
        {/* Back button */}
        <button
          className="back-btn"
          onClick={() => navigate("/?item=Attendee List")}
        >
          ← Back
        </button>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email, preferred name, code"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="DECLINED">Declined</option>
          <option value="NO_SHOW">No Show</option>
        </select>

        {/* Action Buttons */}
        <div className="attendee-actions">
          <button className="print-btn" onClick={handlePrint}>
            Print
          </button>

          <button className="export-btn" onClick={handleExport}>
            Export
          </button>
        </div>
      </div>

      {/* PRINTABLE AREA ONLY */}
      <div ref={printRef}>

        {/* Table */}
        <div className="table-wrapper">
          {loading ? (
            <p>Loading attendees...</p>
          ) : attendees.length === 0 ? (
            <p>No attendees found.</p>
          ) : (
            <table className="attendees-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Preferred Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>

              <tbody>
                {attendees.map((attendee) => (
                  <tr key={attendee.id}>
                    <td>{attendee.firstName || "-"}</td>
                    <td>{attendee.lastName || "-"}</td>
                    <td>{attendee.preferredNameOnBadge || "-"}</td>
                    <td>{attendee.emailAddress || "-"}</td>
                    <td>{attendee.company || "-"}</td>
                    <td>{attendee.position || "-"}</td>
                    <td>{attendee.status || "-"}</td>
                    <td>
                      {attendee.createdAt
                        ? new Date(attendee.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EventAttendees;