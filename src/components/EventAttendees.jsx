import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAttendees,  assignTable, checkInAttendee, getAttendeeById} from "../services/attendeeListService";
import { getEventById } from "../services/eventService";
import "./EventAttendees.css";
import {
  Users,
  CheckCircle2,
  Armchair,
  Hourglass,
  CalendarDays,
  Clock3,
  MapPin,
  ArrowLeft,
  Search,
  Plus,
  Printer,
  Download,
  Upload,
   ArrowUpDown,
  Eye,
  EllipsisVertical
} from "lucide-react";

const EventAttendees = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const printRef = useRef();
  const fileInputRef = useRef();

  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [eventDetails, setEventDetails] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [tableNumber, setTableNumber] = useState("");

  const [activeTab, setActiveTab] = useState("details");
//assign table modal
  const [showAssignModal, setShowAssignModal] = useState(false);

  //check in
  const [checkingIn, setCheckingIn] = useState(false);

  const [checkInSuccess, setCheckInSuccess] = useState(false);


 const handlePrint = () => {
  const printWindow = window.open("", "_blank");

  const tableRows = attendees
    .map(
      (attendee, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${attendee.firstName || "-"}</td>
          <td>${attendee.lastName || "-"}</td>
          <td>${attendee.preferredNameOnBadge || "-"}</td>
          <td>${attendee.emailAddress || "-"}</td>
          <td>${attendee.company || "-"}</td>
          <td>${attendee.position || "-"}</td>
          <td>${attendee.status || "-"}</td>
          <td>${attendee.mealPreference || "-"}</td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${eventDetails?.title || "Event"} Attendees</title>

        <style>
          *{
            box-sizing:border-box;
          }

          body{
            font-family:Arial, Helvetica, sans-serif;
            margin:20px;
            color:#222;
          }

          h1{
            text-align:center;
            margin-bottom:5px;
            font-size:24px;
          }

          h3{
            text-align:center;
            margin-top:0;
            margin-bottom:20px;
            color:#555;
            font-weight:normal;
          }

          table{
            width:100%;
            border-collapse:collapse;
            table-layout:auto;
          }

          thead{
            background:#f5f5f5;
          }

          th,
          td{
            border:1px solid #999;
            padding:8px;
            font-size:11px;
            text-align:left;
            vertical-align:top;
            word-break:break-word;
          }

          th{
            font-weight:bold;
          }

          td:first-child,
          th:first-child{
            width:45px;
            text-align:center;
          }

          tr{
            page-break-inside:avoid;
          }

          @page{
            size:landscape;
            margin:10mm;
          }
        </style>
      </head>

      <body>

       <h1>${eventDetails?.title || "Event"}</h1>
        <h3>Attendees List</h3>

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Preferred Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Position</th>
              <th>Status</th>
              <th>Preferred Meal</th>
             
            </tr>
          </thead>

          <tbody>
            ${tableRows}
          </tbody>
        </table>

      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

  const fetchEventDetails = async () => {
  try {
    const response = await getEventById(eventId);

    const event = response.data;

    setEventDetails(event);
  } catch (err) {
    console.error(err);
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
      console.log(response.data[0]);
      console.log("checkInAt:", response.data[0]?.checkInAt);

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
        "Preferred Meal",
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
        attendee.mealPreference || "",
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

  const assignedTables = attendees.filter(
  (a) => a.tableNumber
).length;

const unassignedTables =
  totalAttendees - assignedTables;

const pendingConfirmation =
  attendees.filter(
    (a) => a.status === "PENDING"
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
          mealPreference: row[6]?.trim() || "",
        }));

      setAttendees((prev) => [...prev, ...newAttendees]);

      alert(`${newAttendees.length} attendees uploaded successfully.`);
    };

    reader.readAsText(file);
  };
// Save table assignment to the backend
const handleAssignTable = async () => {
  if (!selectedAttendee) {
    alert("Please select an attendee.");
    return;
  }

  if (!tableNumber || Number(tableNumber) <= 0) {
    alert("Please enter a valid table number.");
    return;
  }

  try {
    setLoading(true);

    console.log("Assigning Table:", {
      attendeeId: selectedAttendee.id,
      tableNumber: Number(tableNumber),
    });

    const response = await assignTable(
      selectedAttendee.id,
      Number(tableNumber)
    );

    console.log("Assign Table Response:", response);

    // Refresh attendee list from backend
    await fetchAttendees();

    // Update currently opened attendee details
    setSelectedAttendee((prev) => ({
      ...prev,
      tableNumber: Number(tableNumber),
    }));

    // Close Assign Table modal
    setShowAssignModal(false);

    // Reset input
    setTableNumber("");

    alert(response?.message || "Table assigned successfully.");
  } catch (error) {
    console.error(
      "Assign Table Error:",
      error.response?.data || error
    );

    alert(
      error.response?.data?.message ||
      "Failed to assign table."
    );
  } finally {
    setLoading(false);
  }
};
 const handleCheckIn = async () => {
  try {
    const response = await checkInAttendee(selectedAttendee.id);

    if (response.success) {
      // Refresh table
      await fetchAttendees();

      // Get updated attendee
      const updatedAttendee = await getAttendeeById(selectedAttendee.id);

      console.log("Updated Attendee:", updatedAttendee);

      setSelectedAttendee(updatedAttendee.data);

      setCheckInSuccess(true);
    }
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="event-attendees-page">
      <div className="event-header">

    <button
        className="back-button"
        onClick={() => navigate("/published-events")}
    >
        <ArrowLeft size={18} />
        Back
    </button>
   

    <div className="event-title-section">

        <h2>
            {eventDetails?.title || "Loading Event..."}
        </h2>

        <div className="event-meta">

            <span>
                <CalendarDays size={16}/>
                {eventDetails?.startDate || "-"}
            </span>

            <span>
                <Clock3 size={16}/>
                {eventDetails?.checkInTime || "-"} - {eventDetails?.lunchTime || "-"}
            </span>

            <span>
                <MapPin size={16}/>
                {eventDetails?.venue || "-"}
            </span>

        </div>

    </div>

    <div className="header-attendees">

        <Users size={30}/>

        {totalAttendees} Attendees

    </div>

</div>

      {/* Dashboard */}
      <div className="dashboard-grid">

    <div className="dashboard-card">

        <div className="dashboard-icon blue">

            <Users size={30}/>

        </div>

        <div>

            <h1>
                Total Attendees
            </h1>

            <h2>{totalAttendees}</h2>

            <span>
                {totalAttendees} Registered
            </span>

        </div>

    </div>

    <div className="dashboard-card">

        <div className="dashboard-icon green">

            <CheckCircle2 size={30}/>

        </div>

        <div>

           <h1>
                Checked In
           </h1>
            <h2>

                {checkedInCount} / {totalAttendees}

            </h2>

            <div className="progress">

                <div

                    className="progress-fill"

                    style={{
                        width:`${checkedInPercentage}%`
                    }}

                />

            </div>

            <span>

                {checkedInPercentage}% Check-in Rate

            </span>

        </div>

    </div>

    <div className="dashboard-card">

        <div className="dashboard-icon orange">

            <Armchair size={30}/>

        </div>

        <div>

            <h1>Table Assigned</h1>

            <h2>

                {assignedTables}

            </h2>

            <span>

                {unassignedTables} Not Assigned

            </span>

        </div>

    </div>

    <div className="dashboard-card">

        <div className="dashboard-icon purple">

            <Hourglass size={30}/>

        </div>

        <div>

      
            <h1> 
                Pending Confirmations
            </h1>     

            <h2>

                {pendingConfirmation}

            </h2>

            <span>

                {pendingConfirmation === 0

                    ? "All Confirmed"

                    : `${pendingConfirmation} Pending`

                }

            </span>

        </div>

    </div>

</div>

      {/* Controls */}
      <div className="toolbar">

    <div className="toolbar-left">

        <div className="search-box">

            <Search size={18} />

            <input
                type="text"
                placeholder="Search by name, email or company..."
                value={search}
                onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                }}
            />

        </div>

        <select
            value={status}
            onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
            }}
        >
            <option value="">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="DECLINED">Declined</option>
            <option value="NO_SHOW">No Show</option>
        </select>

    </div>

    <div className="toolbar-right">

        <button
         className="blue-btn"
         onClick={() =>
          navigate(`/registration/${eventId}?mode=admin`)
          }>

            <Plus size={18}/>

            Add Attendee

        </button>

        <button
            className="white-btn"
            onClick={handlePrint}
        >
            <Printer size={17}/>

            Print

        </button>

        <button
            className="white-btn"
            onClick={handleExport}
        >
            <Download size={17}/>

            Export

        </button>

        <button
            className="white-btn"
            onClick={() => fileInputRef.current.click()}
        >
            <Upload size={17}/>

            Bulk Upload

        </button>

        <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            hidden
            onChange={handleBulkUpload}
        />

    </div>

</div>
      {/* Table */}
    
       <div className="modern-table-wrapper">
           <div className="table-scroll" ref={printRef}>
  
    {loading ? (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>
                        <div className="th-content">
                          Name
                          <ArrowUpDown size={13} />
                        </div>
                      </th>

                      <th>
                        <div className="th-content">
                          Email
                          <ArrowUpDown size={13} />
                        </div>
                      </th>

                      <th>
                        <div className="th-content">
                          Company
                          <ArrowUpDown size={13} />
                        </div>
                      </th>

                      <th>
                        <div className="th-content">
                          Position
                          <ArrowUpDown size={13} />
                        </div>
                      </th>

                      <th>
                        <div className="th-content">
                          Registration Status
                          <ArrowUpDown size={13} />
                        </div>
                      </th>

                      <th>
                        <div className="th-content">
                          Table No.
                          <ArrowUpDown size={13} />
                        </div>
                      </th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="table-empty">
                          Loading attendees...
                        </td>
                      </tr>
                    ) : attendees.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="table-empty">
                          Loading Attendees . . .
                        </td>
                      </tr>
                    ) : (
                      attendees.map((attendee) => (
                        <tr key={attendee.id}>
                          {/* your existing row */}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
    ) : attendees.length === 0 ? (
                              <table className="modern-table">
                      <thead>
                        <tr>
                          <th>
                            <div className="th-content">
                              Name
                              <ArrowUpDown size={13} />
                            </div>
                          </th>

                          <th>
                            <div className="th-content">
                              Email
                              <ArrowUpDown size={13} />
                            </div>
                          </th>

                          <th>
                            <div className="th-content">
                              Company
                              <ArrowUpDown size={13} />
                            </div>
                          </th>

                          <th>
                            <div className="th-content">
                              Position
                              <ArrowUpDown size={13} />
                            </div>
                          </th>

                          <th>
                            <div className="th-content">
                              Registration Status
                              <ArrowUpDown size={13} />
                            </div>
                          </th>

                          <th>
                            <div className="th-content">
                              Table No.
                              <ArrowUpDown size={13} />
                            </div>
                          </th>

                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="7" className="table-empty">
                              Loading attendees...
                            </td>
                          </tr>
                        ) : attendees.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="table-empty">
                              No attendees found.
                            </td>
                          </tr>
                        ) : (
                          attendees.map((attendee) => (
                            <tr key={attendee.id}>
                              {/* your existing row */}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                        ) : (
      <table className="modern-table">
        <thead>
          <tr>
            <th>
                    <div className="th-content">
                      Name
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  <th>
                    <div className="th-content">
                      Email
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  <th>
                    <div className="th-content">
                      Company
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  <th>
                    <div className="th-content">
                      Position
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  <th>
                    <div className="th-content">
                      Registration Status
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  

                  <th>
                    <div className="th-content">
                      Table No.
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  <th>Actions</th>
                            </tr>
        </thead>

        <tbody>
            {attendees.map((attendee) => (
              <tr key={attendee.id}>

                {/* Name */}
                <td>
                  <div className="attendee-info">
                    <div className="avatar">
                      {(attendee.firstName?.[0] || "")}
                      {(attendee.lastName?.[0] || "")}
                    </div>

                    <div>
                      <div className="attendee-name">
                        {attendee.firstName} {attendee.lastName}
                      </div>

                      <div className="attendee-nickname">
                        {attendee.preferredNameOnBadge || "-"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td>{attendee.emailAddress}</td>

                {/* Company */}
                <td>{attendee.company || "-"}</td>

                {/* Position */}
                <td>{attendee.position || "-"}</td>

                {/* Registration Status */}
                <td>
                  <span
                    className={`status-badge ${
                      attendee.status === "CONFIRMED"
                        ? "confirmed"
                        : attendee.status === "CHECKED_IN"
                        ? "checkedin"
                        : attendee.status === "PENDING"
                        ? "pending"
                        : attendee.status === "DECLINED"
                        ? "declined"
                        : attendee.status === "NO_SHOW"
                        ? "noshow"
                        : "cancelled"
                    }`}
                  >
                    {attendee.status?.replace("_", " ")}
                  </span>
                </td>
              

                {/* Table */}
                <td>
                  {attendee.tableNumber || "Not Assigned"}
                </td>

                {/* Actions */}
                <td>
                      <div className="table-actions">

                          <button
                              className="icon-btn"
                              onClick={() => setSelectedAttendee(attendee)}
                          >
                              <Eye size={17}/>
                          </button>

                          <button
                              className="icon-btn"
                              onClick={handlePrint}
                          >
                              <Printer size={17}/>
                          </button>

                          <button className="icon-btn">
                              <EllipsisVertical size={17}/>
                          </button>

                      </div>
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
    className="attendee-modal-overlay"
    onClick={() => {
      setSelectedAttendee(null);
      setShowAssignForm(false);
      setTableNumber("");
      setActiveTab("details");
    }}
  >
    <div
      className="attendee-modal"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="attendee-modal-header">
        <h2>Attendee Details</h2>

        <button
          className="close-icon"
          onClick={() => {
            setSelectedAttendee(null);
            setShowAssignForm(false);
            setTableNumber("");
            setActiveTab("details");
          }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="attendee-tabs">
        <button
          className={activeTab === "details" ? "active" : ""}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>

        <button
          className={activeTab === "attendance" ? "active" : ""}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance
        </button>

        <button
          className={activeTab === "activity" ? "active" : ""}
          onClick={() => setActiveTab("activity")}
        >
          Activity
        </button>
      </div>

      {/* Body */}
      <div className="attendee-modal-body">

       {activeTab === "details" && (
  <div className="details-layout">

    {/* LEFT CARD */}
    <div className="profile-card">

      <div className="avatar-circle">
        {selectedAttendee.firstName?.charAt(0)}
        {selectedAttendee.lastName?.charAt(0)}
      </div>

      <h3>
        {selectedAttendee.firstName} {selectedAttendee.lastName}
      </h3>

      <p className="preferred-name">
        {selectedAttendee.preferredNameOnBadge}
      </p>

      <span className="status-badge confirmed">
        {selectedAttendee.status}
      </span>

      <p className="attendee-id">
        ID: {selectedAttendee.id?.slice(0,8)}
      </p>

      <div className="qr-card">

          <img

                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${selectedAttendee.id}`}

                alt="QR Code"

                className="qr-image"

            />

        <small>Scan to view badge</small>

      </div>

    </div>

    {/* RIGHT SIDE */}
    <div className="details-right">

  <h4 className="section-heading">
    👤 Personal Information
  </h4>

  <div className="info-grid">

    <label>First Name</label>
    <span>{selectedAttendee.firstName || "-"}</span>

    <label>Last Name</label>
    <span>{selectedAttendee.lastName || "-"}</span>

    <label>Preferred Name</label>
    <span>{selectedAttendee.preferredNameOnBadge || "-"}</span>

    <label>Email</label>
    <span className="email-text">
      {selectedAttendee.emailAddress || "-"}
    </span>

    <label>Company</label>
    <span>{selectedAttendee.company || "-"}</span>

    <label>Position</label>
    <span>{selectedAttendee.position || "-"}</span>

  </div>

  <hr className="section-divider" />

    <h4 className="section-heading">
          📋 Attendance Information
        </h4>

        <div className="info-grid">

          <label>Status</label>

          <span>
            <span
              className={`status-badge ${
                selectedAttendee.status === "CONFIRMED"
                  ? "confirmed"
                  : selectedAttendee.status === "PENDING"
                  ? "pending"
                  : "cancelled"
              }`}
            >
              {selectedAttendee.status}
            </span>
          </span>

          <label>Check-in Status</label>

          <span>
            {selectedAttendee.status === "CHECKED_IN"
              ? "Checked In"
              : "Not Checked In"}
          </span>

          <label>Check-in Time</label>

          <span>
            {selectedAttendee.checkInAt
              ? new Date(selectedAttendee.checkInAt).toLocaleString()
              : "-"}
          </span>

          <label>Checked In By</label>

          <span>
            {selectedAttendee.checkedInBy || "-"}
          </span>

          <label>
            Table Number
          </label>

          <span className="table-row">

            {selectedAttendee.tableNumber || "-"}

            <button
              className="edit-table-btn"
              onClick={() => setShowAssignForm(true)}
            >
            </button>

          </span>

        </div>


        </div>

          </div>
        )}
        {activeTab === "attendance" && (

<div className="attendance-tab">

    <h3>Attendance Summary</h3>

    <div className="attendance-grid">

        <div className="attendance-card">

            <label>Status</label>

            <strong>{selectedAttendee.status}</strong>

        </div>

        <div className="attendance-card">

            <label>Table Number</label>

            <strong>{selectedAttendee.tableNumber || "-"}</strong>

        </div>

        <div className="attendance-card">

            <label>Meal Preference</label>

            <strong>{selectedAttendee.mealPreference || "-"}</strong>

        </div>

        <div className="attendance-card">

            <label>Check In Time</label>

            <strong>

                {selectedAttendee.checkedInAt
                    ? new Date(selectedAttendee.checkedInAt).toLocaleString()
                    : "-"}

            </strong>

        </div>

    </div>

</div>

)}

{activeTab === "activity" && (

<div className="activity-tab">

<h3>Activity Timeline</h3>

<div className="timeline">

<div className="timeline-item">

<div className="timeline-dot"></div>

<div>

<strong>Registered</strong>

<p>

{selectedAttendee.createdAt
? new Date(selectedAttendee.createdAt).toLocaleString()
: "-"}

</p>

</div>

</div>

<div className="timeline-item">

<div className="timeline-dot blue"></div>

<div>

<strong>Checked In</strong>

<p>

{selectedAttendee.checkedInAt
? new Date(selectedAttendee.checkedInAt).toLocaleString()
: "Not yet checked in"}

</p>

</div>

</div>

<div className="timeline-item">

<div className="timeline-dot green"></div>

<div>

<strong>Assigned Table</strong>

<p>

{selectedAttendee.tableNumber
? `Table ${selectedAttendee.tableNumber}`
: "Not assigned"}

</p>

</div>

</div>

</div>

</div>

)}
{showAssignModal && (
  <div
    className="modal-overlay"
    onClick={() => setShowAssignModal(false)}
  >
    <div
      className="assign-table-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h2>Assign Table</h2>

      <p className="assign-subtitle">
        {selectedAttendee.firstName} {selectedAttendee.lastName}
      </p>

      <label>Table Number</label>

      <input
        type="number"
        min="1"
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
        placeholder="Enter table number"
      />

      <div className="assign-actions">
        <button
          className="cancel-btn"
          onClick={() => setShowAssignModal(false)}
        >
          Cancel
        </button>

        <button
          className="save-btn"
          onClick={handleAssignTable}
        >
          Save
        </button>

                
      </div>
    </div>
  </div>
)}
 {checkInSuccess && (
<div className="checkin-success">

    <CheckCircle2
        size={18}
        className="success-icon"
    />

    <div>
        <div className="success-title">
            Successfully Checked In
        </div>

        <div className="success-message">
            Thank you!
        </div>
    </div>

</div>
)}
              </div>

      {/* Footer */}
      <div className="attendee-modal-footer">

        <button
          className="modal-cancel-btn"
          onClick={() => {
            setSelectedAttendee(null);
            setShowAssignForm(false);
            setTableNumber("");
            setActiveTab("details");
          }}
        >
          Cancel
        </button>

        <button className="modal-assign-btn"
         onClick={() => {
        setTableNumber(selectedAttendee.tableNumber || "");
        setShowAssignModal(true);
      }}
        >
          Assign Table
        </button>

        <button className="modal-checkin-btn"
                  disabled={
                  checkingIn ||
                  selectedAttendee?.status === "CHECKED_IN"
              }
              onClick={handleCheckIn}
          >
              {selectedAttendee?.status === "CHECKED_IN"
                  ? "Already Checked In"
                  : checkingIn
                  ? "Checking In..."
                  : "Check In"}
                  
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