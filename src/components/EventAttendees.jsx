import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAttendees,
  assignTable,
  checkInAttendee,
  getAttendeeById,
  getDashboardSummary,
} from "../services/attendeeListService";

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
  EllipsisVertical,
  Utensils,
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
//role filtering 
  const [role, setRole] = useState("");

  const [eventDetails, setEventDetails] = useState(null);
  //pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

//dashboard summary
  const [dashboard, setDashboard] = useState({
  attendees: {
    total: 0,
    registered: 0,
  },
  checkIn: {
    checkedIn: 0,
    total: 0,
    rate: 0,
  },
  tableAssignment: {
    assigned: 0,
    notAssigned: 0,
  },
  confirmation: {
    pending: 0,
    confirmed: 0,
  },
});
const fetchDashboardSummary = async () => {
  try {
    const response = await getDashboardSummary(eventId);
     console.log("Dashboard API:", response);

    setDashboard(response);
  } catch (error) {
    console.error(error);
  }
};
  //total attendees
  const [totalAttendees, setTotalAttendees] = useState(0);


  //Selected Rows using Checkbox
  const [selectedRows, setSelectedRows] = useState([]);

  // Modal states
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [tableNumber, setTableNumber] = useState("");

  //table sorting
  const [sortField, setSortField] = useState("");
const [sortOrder, setSortOrder] = useState("asc");
const handleSort = (field) => {
  if (sortField === field) {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  } else {
    setSortField(field);
    setSortOrder("asc");
  }
};


  const [activeTab, setActiveTab] = useState("details");
  //assign table modal
  const [showAssignModal, setShowAssignModal] = useState(false);

  //check in
  const [checkingIn, setCheckingIn] = useState(false);

  const [checkInSuccess, setCheckInSuccess] = useState(false);
//for companions
const [companions, setCompanions] = useState([]);
  //For Printing
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
              <td>${attendee.checkInAt || "-"}</td>
              <td>${attendee.mealPreference || "-"}</td>
            </tr>
          `,
      )
      .join("");
    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
              
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
                <h5>Attendees List</h5>

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
                      <th>Checked In</th>
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
        role,
      });

      console.log("API Response:", response);
      console.log(response.data[0]);
      console.log("checkInAt:", response.data[0]?.checkInAt);
      console.log(response.data[0]);

      console.log("Pagination:", response.pagination);
      console.log("Total Records:", response.pagination?.totalRecords);
      setAttendees(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalAttendees(response.pagination?.totalRecords || 0);
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
    fetchDashboardSummary();
  }, [eventId, page, search, status, role]);


  const handleViewAttendee = async (attendeeId) => {
    try {
      setLoading(true);

      const response = await getAttendeeById(attendeeId);

      console.log("FULL RESPONSE");
    console.log(response);

    console.log("ATTENDEE");
    console.log(response.data);

    console.log("COMPANIONS");
    console.log(response.data.companions);

      setSelectedAttendee(response.data);
      setActiveTab("details");
    } catch (error) {
      console.error("Failed to fetch attendee details:", error);
      alert("Unable to load attendee details.");
    } finally {
      setLoading(false);
    }
  };



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
        "Checked In",
        "Table Number",
        "Preferred Meal",
      ],
      ...sortedAttendees.map((attendee) => [
        attendee.firstName || "",
        attendee.lastName || "",
        attendee.preferredNameOnBadge || "",
        attendee.emailAddress || "",
        attendee.company || "",
        attendee.position || "",
        attendee.status || "",
        attendee.checkInAt || "",
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
      Number(tableNumber),
    );

    console.log("Assign Table Response:", response);

    // Refresh attendees + dashboard
    await Promise.all([
      fetchAttendees(),
      fetchDashboardSummary(),
    ]);

    // Update currently opened attendee details
    setSelectedAttendee((prev) => ({
      ...prev,
      tableNumber: Number(tableNumber),
    }));

    // Close modal
    setShowAssignModal(false);

    // Reset input
    setTableNumber("");

    alert(response?.message || "Table assigned successfully.");
  } catch (error) {
    console.error("Assign Table Error:", error.response?.data || error);

    alert(error.response?.data?.message || "Failed to assign table.");
  } finally {
    setLoading(false);
  }
};

  //Checking In

 const handleCheckIn = async () => {
  try {
    const response = await checkInAttendee(selectedAttendee.id);

    if (response.success) {
      // Refresh dashboard + attendees at the same time
      await Promise.all([
        fetchAttendees(),
        fetchDashboardSummary(),
      ]);

      // Refresh selected attendee details
      const updatedAttendee = await getAttendeeById(selectedAttendee.id);

      console.log("Updated Attendee:", updatedAttendee);

      setSelectedAttendee(updatedAttendee.data);

      setCheckInSuccess(true);

      alert("Attendee checked in successfully!");
    }
  } catch (error) {
    console.error(error);
  }
};

const displayedAttendees = [...attendees]
  .filter((attendee) => {
    // Role filter
    if (role && attendee.role?.toUpperCase() !== role) {
      return false;
    }

    // Search filter
    if (search) {
      const keyword = search.toLowerCase();

      const matchesSearch =
        attendee.firstName?.toLowerCase().includes(keyword) ||
        attendee.lastName?.toLowerCase().includes(keyword) ||
        attendee.emailAddress?.toLowerCase().includes(keyword) ||
        attendee.company?.toLowerCase().includes(keyword);

      if (!matchesSearch) return false;
    }

    // Status filter
    if (status && attendee.status !== status) {
      return false;
    }

    return true;
  })
  .sort((a, b) => {
  if (!sortField) return 0;

  let valueA = a[sortField];
  let valueB = b[sortField];

  // Handle null/undefined
  valueA = valueA ?? "";
  valueB = valueB ?? "";

  // If both are numbers, compare numerically
  if (typeof valueA === "number" && typeof valueB === "number") {
    return sortOrder === "asc"
      ? valueA - valueB
      : valueB - valueA;
  }

  // Otherwise compare as strings
  valueA = String(valueA).toLowerCase();
  valueB = String(valueB).toLowerCase();

  if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
  if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;

  return 0;
})

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
          <h2>{eventDetails?.title || "Loading Event..."}</h2>
          <div className="event-meta">
            <span>
              <CalendarDays size={16} />
              {eventDetails?.startDate || "-"}
            </span>
            <span>
              <Clock3 size={16} />
              {eventDetails?.checkInTime || "-"} -{" "}
              {eventDetails?.lunchTime || "-"}
            </span>
            <span>
              <MapPin size={16} />
              {eventDetails?.venue || "-"}
            </span>
          </div>
        </div>

        <div className="header-attendees">
          <Users size={30} />
          {totalAttendees} Attendees
        </div>
      </div>

      {/* Dashboard */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-icon blue">
            <Users size={30} />
          </div>
          <div>
            <h1>Total Attendees</h1>
            <h3>{dashboard.attendees.total}</h3>
            <span>{dashboard.attendees.total} Primary</span> <br></br>
            <span>{dashboard.attendees.total} Companion</span>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon green">
            <CheckCircle2 size={30} />
          </div>
          <div>
            <h1>Checked In</h1>
            <h3>
              {dashboard.checkIn.checkedIn}
            </h3>
            <div className="progress">
              <div
                className="progress-fill"
                style={{
                  width: `${dashboard.checkIn.rate}%`,
                }}
              />
            </div>
            <span>{dashboard.checkIn.rate}% Check-in Rate</span>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon orange">
            <Armchair size={30} />
          </div>
          <div>
            <h1>Table Assigned</h1>
            <h3>{dashboard.tableAssignment.assigned}</h3>
            <span>{dashboard.tableAssignment.notAssigned} Not Assigned</span>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-icon purple">
            <Utensils size={30} />
          </div>
          <div>
            <h1>Meal Preference</h1>
            <span> Meal 1: {dashboard.confirmation.confirmed}</span><br></br>
            <span> Meal 2: {dashboard.confirmation.confirmed}</span><br></br>
            <span> Meal 3: {dashboard.confirmation.confirmed}</span>         
          </div>
        </div>
      </div>
      {/* Controls */}
   <div className="toolbar">
        <div className="toolbar-left">
          <div>
           
            <input
              type="text"
              placeholder=" Search by name, email or company..."
              value={search}
              className="search-box"
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
                
              }}
            />
         </div>
           {/* Role Filter */}
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Roles</option>
              <option value="PRIMARY">Primary</option>
              <option value="COMPANION">Companion</option>
            </select>
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
            onClick={() => navigate(`/registration/${eventId}?mode=admin`)}
          >
            <Plus size={18} />
            Add Attendee
          </button>
          <button className="white-btn" onClick={handlePrint}>
            <Printer size={17} />
            Print
          </button>
          <button className="white-btn" onClick={handleExport}>
            <Download size={17} />
            Export
          </button>
          <button
            className="white-btn"
            onClick={() => fileInputRef.current.click()}
          >
            <Upload size={17} />
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
    <table className="modern-table">
      <thead>
        <tr>
          <th className="w-12 px-4 py-3 text-center">
            {!loading && displayedAttendees.length > 0 && (
              <input
                type="checkbox"
                checked={
                  displayedAttendees.length > 0 &&
                  selectedRows.length === displayedAttendees.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRows(displayedAttendees.map((a) => a.id));
                  } else {
                    setSelectedRows([]);
                  }
                }}
                className="h-4 w-4 cursor-pointer accent-red-600"
              />
            )}
          </th>

          <th onClick={() => handleSort("firstName")}>
            <div className="th-content">
              Name
              <ArrowUpDown size={13} />
            </div>
          </th>

          <th onClick={() => handleSort("emailAddress")}>
            <div className="th-content">
              Email
              <ArrowUpDown size={13} />
            </div>
          </th>

          <th onClick={() => handleSort("company")}>
            <div className="th-content">
              Company
              <ArrowUpDown size={13} />
            </div>
          </th>

          <th onClick={() => handleSort("position")}>
            <div className="th-content">
              Position
              <ArrowUpDown size={13} />
            </div>
          </th>

          <th onClick={() => handleSort("status")}>
            <div className="th-content">
              Status
              <ArrowUpDown size={13} />
            </div>
          </th>


          <th onClick={() => handleSort("tableNumber")}>
            <div className="th-content">
              Table No.
              <ArrowUpDown size={13} />
            </div>
          </th>

          <th onClick={() => handleSort("mealPreference")}>
            <div className="th-content">
              Meal
              <ArrowUpDown size={13} />
            </div>
          </th>

          <th onClick={() => handleSort("role")}>
            <div className="th-content">
              Role
              <ArrowUpDown size={13} />
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan={10} className="table-empty">
              Loading attendees...
            </td>
          </tr>
        ) : displayedAttendees.length === 0 ? (
          <tr>
            <td colSpan={10} className="table-empty">
              No attendees found.
            </td>
          </tr>
        ) : (
          displayedAttendees.map((attendee) => (
            <tr
              key={attendee.id}
              className="clickable-row"
              onClick={() => handleViewAttendee(attendee.id)}
            >
              {/* Checkbox */}
              <td className="text-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-red-600"
                  checked={selectedRows.includes(attendee.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows([...selectedRows, attendee.id]);
                    } else {
                      setSelectedRows(
                        selectedRows.filter((id) => id !== attendee.id)
                      );
                    }
                  }}
                />
              </td>

              {/* Name */}
              <td>
                <div className="attendee-info">
                  <div>
                    <div className="attendee-name">
                      {attendee.firstName} {attendee.lastName}
                    </div>
                  </div>
                </div>
              </td>

              {/* Email */}
              <td>{attendee.emailAddress || "-"}</td>

              {/* Company */}
              <td>{attendee.company || "-"}</td>

              {/* Position */}
              <td>{attendee.position || "-"}</td>

              {/* Status */}
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
              <td>{attendee.tableNumber || "Not Assigned"}</td>

              {/* Meal */}
              <td>{attendee.mealPreference || "Not Assigned"}</td>

              {/* Role */}
              <td>{attendee.role || "Not Assigned"}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
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
          <div className="attendee-modal" onClick={(e) => e.stopPropagation()}>
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
              
          {/* COMPANION TAB FOR PRIMARY ATTENDEE VISIBLE ONLY*/}
              {selectedAttendee?.role === "PRIMARY" && (
                <button
                  className={`tab-btn ${activeTab === "companion" ? "active" : ""}`}
                  onClick={() => setActiveTab("companion")}
                >
                  Companion

                  {selectedAttendee?.companions?.length > 0 && (
                    <span className="tab-badge">
                      {selectedAttendee.companions.length}
                    </span>
                  )}
                </button>
              )}
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
                        {selectedAttendee?.role === "COMPANION" && (
                          <span className="companion-label"> (Companion)</span>
                        )}
                    </h3>

                   

                    <p className="attendee-id">
                      Code: {selectedAttendee.attendeesCode}
                    </p>

                    <div className="qr-card">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${selectedAttendee.attendeesCode}`}
                        alt="QR Code"
                        className="qr-image"
                      />
                      <small>Scan to view badge</small>
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="details-right">
                    <h4 className="section-heading">👤 Personal Information</h4>
                    <div className="info-grid">
                      <label>First Name</label>
                      <span>{selectedAttendee.firstName || "-"}</span>

                      <label>Last Name</label>
                      <span>{selectedAttendee.lastName || "-"}</span>

                      <label>Preferred Name</label>
                      <span>
                        {selectedAttendee.preferredNameOnBadge || "-"}
                      </span>

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
                              : selectedAttendee.status === "CHECKED IN"
                                ? "checked_in"
                                : "cancelled"
                          }`}
                        >
                          
                          {selectedAttendee.status}
                        </span>
                      </span>

                      {selectedAttendee?.role === "COMPANION" && (
                      <>
                        <label>Primary Attendee</label>
                        <span>
                          {selectedAttendee.primaryAttendee
                            ? `${selectedAttendee.primaryAttendee.firstName} ${selectedAttendee.primaryAttendee.lastName}`
                            : "-"}
                        </span>
                      </>
                    )}
                    <label>Check-in Status</label>
                      <span>
                        {selectedAttendee.status === "CHECKED_IN"
                          ? "Checked In"
                          : "Not Checked In"}
                      </span>
                      <label>Check-in Time</label>
                      <span>
                        {selectedAttendee.checkInAt
                          ? new Date(
                              selectedAttendee.checkInAt,
                            ).toLocaleString()
                          : "-"}
                      </span>

                      <label>Checked In By</label>

                      <span>{selectedAttendee.checkedInBy || "-"}</span>

                      <label>Table Number</label>

                      <span className="table-row">
                        {selectedAttendee.tableNumber || "-"}

                        <button
                          className="edit-table-btn"
                          onClick={() => setShowAssignForm(true)}
                        ></button>
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
                        {selectedAttendee.checkInAt
                          ? new Date(
                              selectedAttendee.checkInAt,
                            ).toLocaleString()
                          : "-"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
         {/* Companion Tab */}
              {activeTab === "companion" && (
                <div className="companion-tab">

                  <div className="companion-header">
                    <h3>Companion List</h3>
                    <span>
                      {selectedAttendee?.companions?.length || 0} Registered
                    </span>
                  </div>

                  <div className="companion-list">

                    {selectedAttendee?.companions?.length > 0 ? (

                      selectedAttendee.companions.map((companion) => (

                        <div
                          key={companion.id}
                          className="companion-card"
                        >

                          <div className="companion-avatar">
                            👤
                          </div>

                          <div className="companion-info">
                            <h4>
                              {companion.firstName} {companion.lastName}
                            </h4>

                            <p>{companion.position || "No Position"}</p>
                          </div>

                          <div className="companion-meta">


                            <span className="table-chip">
                              {companion.tableNumber
                                ? `Table ${companion.tableNumber}`
                                : "Not Assigned"}
                            </span>

                          </div>

                        </div>

                      ))

                    ) : (

                      <div className="empty-companions">
                        No companions registered.
                      </div>

                    )}

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
                        className="cancel-table-btn"
                        onClick={() => setShowAssignModal(false)}
                      >
                        Cancel
                      </button>

                      <button
                        className="save-table-btn"
                        onClick={handleAssignTable}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
          {(activeTab === "details" || activeTab === "attendance") && (  
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

              <button
                className="modal-assign-btn"
                onClick={() => {
                  setTableNumber(selectedAttendee.tableNumber || "");
                  setShowAssignModal(true);
                }}
              >
                Assign Table
              </button>

              <button
                className="modal-checkin-btn"
                disabled={
                  checkingIn || selectedAttendee?.status === "CHECKED_IN"
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
            )}
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
