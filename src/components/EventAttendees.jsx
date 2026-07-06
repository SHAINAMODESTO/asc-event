import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAttendees } from "../services/attendeeListService";
import { getEventById } from "../services/eventService";
import "./EventAttendees.css";

const EventAttendees = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const printRef = useRef();
  const fileInputRef = useRef();

  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [eventName, setEventName] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [tableNumber, setTableNumber] = useState("");

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;

    window.location.reload();
  };

  const fetchEventDetails = async () => {
    try {
      const response = await getEventById(eventId);

      console.log("Event details:", response);

      setEventName(response.data?.title || "Event");
    } catch (error) {
      console.error("Fetch event details error:", error);
      setEventName("Event");
    }
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
    fetchEventDetails();
    fetchAttendees();
  }, [eventId, page, search, status]);

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
        "Table Number",
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
        attendee.tableNumber || "",
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
    link.download = `attendees-${eventId}.csv`;
    link.click();
  };

  const totalAttendees = attendees.length;

  const checkedInCount = attendees.filter(
    (a) => a.status === "CHECKED_IN"
  ).length;

  const checkedInPercentage =
    totalAttendees > 0
      ? ((checkedInCount / totalAttendees) * 100).toFixed(1)
      : 0;

  const calledCount = attendees.filter(
    (a) => a.status === "CALLED"
  ).length;

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").map((row) => row.split(","));

      const dataRows = rows.slice(1);

      const newAttendees = dataRows
        .filter((row) => row.length >= 6)
        .map((row, index) => ({
          id: `${eventId}-${Date.now()}-${index}`,
          eventId,
          firstName: row[0]?.trim(),
          lastName: row[1]?.trim(),
          preferredNameOnBadge: row[2]?.trim(),
          emailAddress: row[3]?.trim(),
          company: row[4]?.trim(),
          position: row[5]?.trim(),
          status: "PENDING",
          createdAt: new Date().toISOString(),
        }));

      setAttendees((prev) => [...prev, ...newAttendees]);

      alert(`${newAttendees.length} attendees uploaded successfully.`);
    };

    reader.readAsText(file);
  };

  return (
    <div className="event-attendees-page">
      <div className="attendees-header">
        <h1>{eventName} Attendees</h1>
        <p>{attendees.length} attendee(s)</p>
      </div>

      {/* Dashboard */}
      <div className="attendees-dashboard">
        <div className="dashboard-card">
          <h3>Total Attendees</h3>
          <p>{totalAttendees}</p>
        </div>

        <div className="dashboard-card">
          <h3>Checked-in Rate</h3>
          <p>{checkedInPercentage}%</p>
        </div>

        <div className="dashboard-card">
          <h3>Called by Coordinator</h3>
          <p>{calledCount}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="attendees-controls">
        <button
          className="back-btn"
          onClick={() => navigate("/published-events")}
        >
          ← Back
        </button>

        <input
          type="text"
          placeholder="Search attendees..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

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

        <div className="attendee-actions">
          <button className="print-btn" onClick={handlePrint}>
            Print
          </button>

          <button className="export-btn" onClick={handleExport}>
            Export
          </button>

          <button
            className="bulk-upload-btn"
            onClick={() => fileInputRef.current.click()}
          >
            Bulk Upload
          </button>

          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleBulkUpload}
          />
        </div>
      </div>

      {/* Table */}
      <div ref={printRef}>
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
                  <tr
                    key={attendee.id}
                    onClick={() => setSelectedAttendee(attendee)}
                    className="clickable-row"
                  >
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

      {/* Modal */}
      {selectedAttendee && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedAttendee(null);
            setShowAssignForm(false);
            setTableNumber("");
          }}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Attendee Details</h2>

            <p><b>First Name:</b> {selectedAttendee.firstName}</p>
            <p><b>Last Name:</b> {selectedAttendee.lastName}</p>
            <p><b>Preferred Name:</b> {selectedAttendee.preferredNameOnBadge}</p>
            <p><b>Email:</b> {selectedAttendee.emailAddress}</p>
            <p><b>Company:</b> {selectedAttendee.company}</p>
            <p><b>Position:</b> {selectedAttendee.position}</p>
            <p><b>Status:</b> {selectedAttendee.status}</p>
            <p><b>Table Number:</b> {selectedAttendee.tableNumber || "-"}</p>

            {/* Assign Table Form */}
            {showAssignForm && (
              <div className="assign-form">
                <label>Table Number</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Enter table number"
                />

                <button
                  className="save-table-btn"
                  onClick={() => {
                    if (!tableNumber.trim()) {
                      alert("Please enter a table number.");
                      return;
                    }

                    setAttendees((prev) =>
                      prev.map((attendee) =>
                        attendee.id === selectedAttendee.id
                          ? { ...attendee, tableNumber }
                          : attendee
                      )
                    );

                    setSelectedAttendee((prev) => ({
                      ...prev,
                      tableNumber,
                    }));

                    alert(
                      `${selectedAttendee.firstName} assigned to Table ${tableNumber}`
                    );

                    setShowAssignForm(false);
                    setTableNumber("");
                  }}
                >
                  Save Table
                </button>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="assign-btn"
                onClick={() => setShowAssignForm(true)}
              >
                Assign Table
              </button>

              <button
                className="close-btn"
                onClick={() => {
                  setSelectedAttendee(null);
                  setShowAssignForm(false);
                  setTableNumber("");
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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