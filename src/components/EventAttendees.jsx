import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAttendees,
  assignTable,
  checkInAttendee,
  getAttendeeById,
  getDashboardSummary,
  createCompanion,
  updateCompanions,
  updatePrimaryAttendee,
  bulkCheckInAttendees,
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
  Badge,
  UtensilsCrossed,
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
// ========================================
// EDIT ATTENDEE MODAL
// ========================================

const [showEditAttendeeModal, setShowEditAttendeeModal] = useState(false);

const [editingAttendee, setEditingAttendee] = useState(null);

// ========================================
// OPEN EDIT ATTENDEE MODAL
// ========================================

const handleEditAttendee = () => {
  setEditingAttendee({
    ...selectedAttendee,
  });

  setShowEditAttendeeModal(true);
};
// ========================================
// UPDATE PRIMARY ATTENDEE
// ========================================

const handleUpdateAttendee = async () => {
  console.log("Updating attendee...");

  console.log(editingAttendee);

  try {
    await updatePrimaryAttendee(
      editingAttendee.id,
      {
        firstName: editingAttendee.firstName,
        middleName: editingAttendee.middleName,
        lastName: editingAttendee.lastName,
        preferredNameOnBadge:
          editingAttendee.preferredNameOnBadge,
        emailAddress: editingAttendee.emailAddress,
        contactNumber: editingAttendee.contactNumber,
        company: editingAttendee.company,
        position: editingAttendee.position,
        mealPreference: editingAttendee.mealPreference,
      }
    );

    alert("Attendee updated successfully!");

    // Refresh attendee details
    const updatedAttendee = await getAttendeeById(
      editingAttendee.id
    );

    setSelectedAttendee(updatedAttendee.data);

    setShowEditAttendeeModal(false);
    setEditingAttendee(null);

  } catch (error) {
    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to update attendee."
    );
  }
};


// ===============================
// Add Companion Modal
// ===============================

const [showAddCompanionModal, setShowAddCompanionModal] = useState(false);

const emptyCompanion = {
  firstName: "",
  lastName: "",
  position: "",
  preferredNameOnBadge: "",
  mealPreference: "",
};

const [companions, setCompanions] = useState([
  { ...emptyCompanion },
]);
const handleAddCompanion = () => {
  const existingCompanions = selectedAttendee?.companions?.length || 0;

  if (existingCompanions >= 5) {
    alert("Maximum of 5 companions is allowed per primary attendee.");
    return;
  }

  // Always reset form
  setCompanions([{ ...emptyCompanion }]);
 

  console.log("EVENT OBJECT");
  console.log(selectedAttendee.event);


  setShowAddCompanionModal(true);
};
const handleAddCompanionField = () => {
  const existingCompanions =
    selectedAttendee?.companions?.length || 0;

  if (existingCompanions + companions.length >= 5) {
    alert("Maximum of 5 companions is allowed.");
    return;
  }

  setCompanions((prev) => [
    ...prev,
    { ...emptyCompanion },
  ]);
};
const handleRemoveCompanionField = (index) => {
  setCompanions((prev) => {
    if (prev.length === 1) return prev;

    return prev.filter((_, i) => i !== index);
  });
};
const updateCompanion = (index, field, value) => {
  setCompanions((prev) =>
    prev.map((companion, i) =>
      i === index
        ? {
            ...companion,
            [field]: value,
          }
        : companion
    )
  );
};
// add companion under primary attendee
const handleSaveCompanion = async () => {
  try {
    const primaryId = selectedAttendee.id;

    const payload = companions.map((companion) => ({
      firstName: companion.firstName,
      lastName: companion.lastName,
      position: companion.position,
      preferredNameOnBadge: companion.preferredNameOnBadge,
      mealPreference: companion.mealPreference,
    }));

    for (const companion of payload) {
      await createCompanion(primaryId, companion);
    }

    alert("Companion(s) added successfully!");

    // Refresh attendee details
    const updatedAttendee = await getAttendeeById(primaryId);

    setSelectedAttendee(updatedAttendee.data);

    setShowAddCompanionModal(false);

    // Reset form
    setCompanions([
      {
        firstName: "",
        lastName: "",
        position: "",
        preferredNameOnBadge: "",
        mealPreference: "",
      },
    ]);
  } catch (error) {
    console.error(error);

    alert(
      error.response?.data?.message ||
        "Failed to create companion."
    );
  }
};

// edit companion details

const handleUpdateCompanion = async () => {
  

  const payload = {
    firstName: editingCompanion.firstName,
    lastName: editingCompanion.lastName,
    preferredNameOnBadge: editingCompanion.preferredNameOnBadge,
    position: editingCompanion.position,
    mealPreference: editingCompanion.mealPreference,
  };



  try {
    const result = await updateCompanions(
      selectedAttendee.id,
      editingCompanion.id,
      payload
    );


    const updatedAttendee = await getAttendeeById(selectedAttendee.id);


    setSelectedAttendee(updatedAttendee.data);

     alert("Companion details updated successfully.");

    setShowEditCompanionModal(false);
    setEditingCompanion(null);

  } catch (error) {
    console.error("5. Error:", error);
  }
};
// ========================================
// EDIT COMPANION MODAL
// ========================================

const [showEditCompanionModal, setShowEditCompanionModal] = useState(false);

const [editingCompanion, setEditingCompanion] = useState(null);



// ========================================
// BULK CHECK IN MODAL
// ========================================

const [showBulkCheckInModal, setShowBulkCheckInModal] = useState(false);

const [selectedCompanions, setSelectedCompanions] = useState([]);

const handleOpenBulkCheckIn = () => {
  setSelectedCompanions([]);
  setShowBulkCheckInModal(true);
};
// ========================================
// BULK CHECK IN MAIN FUNCTION
// ========================================

const handleBulkCheckIn = async () => {
  try {
    if (selectedCompanions.length === 0) {
      alert("Please select at least one companion.");
      return;
    }

    // Include the primary attendee
    const attendeeIds = [
        ...(selectedAttendee.status !== "CHECKED_IN"
          ? [selectedAttendee.id]
          : []),
        ...selectedCompanions,
      ];

    console.log("Attendees to Check In:");
    console.log(attendeeIds);

    const response = await bulkCheckInAttendees(attendeeIds);

    console.log("Bulk Check In Response:");
    console.log(response);

    alert(response.message);

    // Refresh attendee details
    const updatedAttendee = await getAttendeeById(
      selectedAttendee.id
    );

    setSelectedAttendee(updatedAttendee.data);

    // Close modal
    setShowBulkCheckInModal(false);

    // Clear selections
    setSelectedCompanions([]);

  } catch (error) {
    console.error("Bulk Check In Error:", error);

    alert(
      error.response?.data?.message ||
      "Bulk check in failed."
    );
  }
};
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
              <td>${attendee.role || "-"}</td>
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
                    padding:6px;
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
                      <th>Checked In</th>
                      <th>Preferred Meal</th>
                      <th>Role</th>
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
      ...attendees.map((attendee) => [
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
  console.log("Assign Table clicked");
  console.log("Attendee ID:", selectedAttendee.id);
  console.log("Table Number:", tableNumber);

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
 {/* Attendee Modal */}
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

                       <label>Meal Preference</label>

                      <span>{selectedAttendee.mealPreference || "-"}</span>  

                      <div>
                            <button className="edit-info-btn" onClick={handleEditAttendee}>
                              Edit Info
                            </button>  
                      </div>
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
                  <div className="companion-header-left">
                    <h3>Companion List</h3>
                  </div>

                  <div className="companion-header-right">
                    <span className="companion-count">
                      {selectedAttendee?.companions?.length || 0} Registered
                    </span>

                    <button
                      className="add-companion-btn"
                      onClick={handleAddCompanion}
                    >
                      <Plus size={16} />
                      Add Companion
                    </button>
                  </div>
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

                          <p className="companion-position">
                            {companion.position || "No Position"}
                          </p>

                       <div className="companion-extra">

                            <div className="companion-detail">
                              <Badge size={15} />
                              <span>
                                {companion.preferredNameOnBadge || "-"}
                              </span>
                            </div>

                            <div className="companion-detail">
                              <Armchair size={15} />
                              <span
                                className={
                                  companion.tableNumber
                                    ? "table-assigned"
                                    : "table-unassigned"
                                }
                              >
                                {companion.tableNumber
                                  ? `Table ${companion.tableNumber}`
                                  : "Not Assigned"}
                              </span>
                            </div>

                            <div className="companion-detail">
                              <UtensilsCrossed size={15} />
                              <span>
                                {companion.mealPreference || "Not Selected"}
                              </span>
                            </div>

                            {companion.status === "CHECKED_IN" && (
                              <div className="companion-detail">
                                <Clock3 size={15} />
                                <span>
                                  {new Date(companion.checkInAt).toLocaleString()}
                                </span>
                              </div>
                            )}

                                  </div>

                        </div>

                        <div className="companion-meta">

                            <span
                              className={
                                companion.status === "CHECKED_IN"
                                  ? "status-chip checked-in"
                                  : "status-chip pending"
                              }
                            >
                              {companion.status === "CHECKED_IN"
                                ? "✓ Checked In"
                                : "● Pending"}
                            </span>

                            <button
                              className="assign-table-btn"
                              onClick={(e) => {
                                e.stopPropagation();

                                // Keep the selected primary attendee
                                // because the backend assigns the table to the whole group
                                setTableNumber(companion.tableNumber || "");
                                setShowAssignModal(true);
                              }}
                            >
                              
                              {companion.tableNumber ? "Change Table" : "Assign Table"}
                            </button>

                            <button
                              type="button"
                              className="edit-companion-btn"
                              onClick={(e) => {
                                e.stopPropagation();

                                setEditingCompanion({
                                  ...companion,
                                });

                                setShowEditCompanionModal(true);
                              }}
                            >
                              Edit
                            </button>

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

{/* ========================================
           EDIT ATTENDEE MODAL
======================================== */}
               {showEditAttendeeModal && editingAttendee && (

                <div className="modal-overlay" onClick={() => setShowEditAttendeeModal(false)}>
                  <div className="edit-attendee-modal" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="edit-attendee-header">
                     
                      <h2>Edit Attendee Information</h2>
                      <p>
                        Update attendee details for{" "}
                        <strong>
                          {selectedAttendee.firstName} {selectedAttendee.lastName}
                        </strong>
                      </p>
                    </div> 
                    {/* Body */}
                  <div className="edit-attendee-form"> 
                     {/*First Name */}
                     <div className="form-group">
                        <label>First Name:</label>
                         <input
                          type="text"
                          value={editingAttendee.firstName || ""}
                          onChange={(e) =>
                            setEditingAttendee({
                              ...editingAttendee,
                              firstName: e.target.value,
                            })
                          }
                        />
                     </div>
                     {/*Middle Name */}
                     <div className="form-group">
                        <label>Middle Name:</label>
                         <input
                          type="text"
                          value={editingAttendee.middleName || ""}
                          onChange={(e) =>
                            setEditingAttendee({
                              ...editingAttendee,
                              middkeName: e.target.value,
                            })
                          }
                        />
                     </div>
                    {/* Last Name */}
                    <div className="form-group">
                      <label>Last Name</label>

                      <input
                        type="text"
                        value={editingAttendee.lastName || ""}
                        onChange={(e) =>
                          setEditingAttendee({
                            ...editingAttendee,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                    {/* Preferred Name */}
                    <div className="form-group">
                      <label>Preferred Name on Badge</label>

                      <input
                        type="text"
                        value={editingAttendee.preferredNameOnBadge || ""}
                        onChange={(e) =>
                          setEditingAttendee({
                            ...editingAttendee,
                            preferredNameOnBadge: e.target.value,
                          })
                        }
                      />
                    </div>
                    {/* Email Address */}
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="text"
                        value={editingAttendee.emailAddress || ""}
                        onChange={(e) =>
                          setEditingAttendee({
                            ...editingAttendee,
                            emailAddress: e.target.value,
                          })
                        }
                      />
                    </div>  
                    {/* Contact Number*/}
                    <div className="form-group">
                      <label>Contact Number</label>
                      <input
                        type="number"
                        value={editingAttendee.contactNumber || ""}
                        onChange={(e) =>
                          setEditingAttendee({
                            ...editingAttendee,
                            contactNumber: e.target.value,
                          })
                        }
                      />
                    </div> 
                    {/* Company*/}
                    <div className="form-group">
                      <label>Company</label>
                      <input
                        type="text"
                        value={editingAttendee.company || ""}
                        onChange={(e) =>
                          setEditingAttendee({
                            ...editingAttendee,
                            company: e.target.value,
                          })
                        }
                      />
                    </div> 
                     {/* Posution */}
                    <div className="form-group">
                      <label>Position</label>
                      <input
                        type="text"
                        value={editingAttendee.position || ""}
                        onChange={(e) =>
                          setEditingAttendee({
                            ...editingAttendee,
                            position: e.target.value,
                          })
                        }
                      />
                    </div> 
                    {/* Meal Preference */}
                    <div className="form-group">
                      <label>Meal Preference</label>
                            <select
                              value={editingAttendee.mealPreference || ""}
                              onChange={(e) =>
                                setEditingAttendee({
                                  ...editingAttendee,
                                  mealPreference: e.target.value,
                                })
                              }
                            >
                              <option value="">Select Meal Preference</option>

                            {(selectedAttendee?.event?.mealPreferences ?? []).map(
                              (meal, index) => (
                                <option
                                  key={index}
                                  value={meal}
                                >
                                  {meal}
                                </option>
                              )
                            )}
                          </select>
                    </div>
                  </div>  
                {/* Footer */}
                <div className="edit-attendee-footer">
                  <button className="attendee-cancel-btn"
                          onClick={() => {
                            setShowEditAttendeeModal(false);
                            setEditingAttendee(null);
                          }}>
                    Cancel
                  </button>
                   <button className="attendee-save-btn"
                          onClick={handleUpdateAttendee}>
                    Save Changes
                  </button>

                </div>
            </div>
          </div>
        )}



{/* ========================================
          ADD COMPANION MODAL
======================================== */}
           {showAddCompanionModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowAddCompanionModal(false)}
          >
            <div
              className="add-companion-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="add-companion-header">
                <div>
                  <h2>Add Companion</h2>

                  <p>
                    Register companion(s) for{" "}
                    <strong>
                      {selectedAttendee.firstName}{" "}
                      {selectedAttendee.lastName}
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="add-companion-btn"
                  onClick={handleAddCompanionField}
                >
                  + Add Companion
                </button>
              </div>

              <div className="companion-modal-body">
                {companions.map((companion, index) => (
                  <div
                    key={index}
                    className="companion-form-card"
                  >
                    <div className="companion-form-grid">

                      <div className="form-group">
                        <label>First Name</label>

                        <input
                          type="text"
                          value={companion.firstName}
                          onChange={(e) =>
                            updateCompanion(
                              index,
                              "firstName",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Last Name</label>

                        <input
                          type="text"
                          value={companion.lastName}
                          onChange={(e) =>
                            updateCompanion(
                              index,
                              "lastName",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Relationship / Position</label>

                        <input
                          type="text"
                          value={companion.position}
                          onChange={(e) =>
                            updateCompanion(
                              index,
                              "position",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Preferred Name on Badge
                        </label>

                        <input
                          type="text"
                          value={
                            companion.preferredNameOnBadge
                          }
                          onChange={(e) =>
                            updateCompanion(
                              index,
                              "preferredNameOnBadge",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Meal Preference</label>

                        <select
                          value={companions[index].mealPreference}
                          onChange={(e) =>
                            updateCompanion(index, "mealPreference", e.target.value)
                          }
                        >
                          <option value="">Select Meal Preference</option>

                          {(selectedAttendee?.event?.mealPreferences ?? []).map((meal, idx) => (
                            <option key={idx} value={meal}>
                              {meal}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group remove-group">
                        <button
                          type="button"
                          className="remove-companion-btn"
                          onClick={() =>
                            handleRemoveCompanionField(index)
                          }
                          disabled={companions.length === 1}
                        >
                          Remove
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
            </div>

            <div className="add-companion-footer">

              <button
                className="companion-cancel-btn"
                onClick={() =>
                  setShowAddCompanionModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="companion-save-btn"
                onClick={handleSaveCompanion}
              >
                Save Companion(s)
              </button>

            </div>
          </div>
        </div>
      )}

{/* ========================================
     EDIT COMPANION MODAL
======================================== */}

                {showEditCompanionModal && editingCompanion && (
                  <div
                    className="modal-overlay"
                    onClick={() => {
                      setShowEditCompanionModal(false);
                      setEditingCompanion(null);
                    }}
                  >
                    <div
                      className="edit-companion-modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="edit-companion-header">
                        <h2>Edit Companion</h2>

                        <p>
                          Update companion information.
                        </p>
                      </div>

                      {/* Form */}
                      <div className="edit-companion-form">

                        {/* First Name */}
                        <div className="form-group">
                          <label>First Name</label>

                          <input
                            type="text"
                            placeholder="Enter First Name"
                            value={editingCompanion.firstName || ""}
                            onChange={(e) =>
                              setEditingCompanion({
                                ...editingCompanion,
                                firstName: e.target.value,
                              })
                            }
                          />
                        </div>

                        {/* Last Name */}
                        <div className="form-group">
                          <label>Last Name</label>

                          <input
                            type="text"
                            placeholder="Enter Last Name"
                            value={editingCompanion.lastName || ""}
                            onChange={(e) =>
                              setEditingCompanion({
                                ...editingCompanion,
                                lastName: e.target.value,
                              })
                            }
                          />
                        </div>

                        {/* Relationship / Position */}
                        <div className="form-group full-width">
                          <label>Relationship / Position</label>

                          <input
                            type="text"
                            placeholder="Relationship / Position"
                            value={editingCompanion.position || ""}
                            onChange={(e) =>
                              setEditingCompanion({
                                ...editingCompanion,
                                position: e.target.value,
                              })
                            }
                          />
                        </div>

                        {/* Preferred Name */}
                        <div className="form-group">
                          <label>Preferred Name on Badge</label>

                          <input
                            type="text"
                            placeholder="Preferred Name"
                            value={editingCompanion.preferredNameOnBadge || ""}
                            onChange={(e) =>
                              setEditingCompanion({
                                ...editingCompanion,
                                preferredNameOnBadge: e.target.value,
                              })
                            }
                          />
                        </div>

                        {/* Meal Preference */}
                        <div className="form-group">
                          <label>Meal Preference</label>

                          <select
                            value={editingCompanion.mealPreference || ""}
                            onChange={(e) =>
                              setEditingCompanion({
                                ...editingCompanion,
                                mealPreference: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Meal Preference</option>

                            {(selectedAttendee?.event?.mealPreferences ?? []).map(
                              (meal, index) => (
                                <option
                                  key={index}
                                  value={meal}
                                >
                                  {meal}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                      </div>


                      {/* Footer */}
                      <div className="edit-companion-footer">

                        <button
                          className="companion-cancel-btn"
                          onClick={() => {
                            setShowEditCompanionModal(false);
                            setEditingCompanion(null);
                          }}
                        >
                          Cancel
                        </button>

                  
                        <button
                            className="companion-save-btn"
                            onClick={handleUpdateCompanion}
                          >
                            Save Changes
                          </button>
                       
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

              {selectedAttendee?.role === "PRIMARY" &&
                  selectedAttendee?.companions?.length > 0 && (

                  <button
                      className="modal-bulk-checkin-btn"
                      onClick={handleOpenBulkCheckIn}
                  >
                      Bulk Check In
                  </button>

                  )}
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

{/* ========================================
            BULK CHECKIN MODAL
 ======================================== */}

      {showBulkCheckInModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowBulkCheckInModal(false)}>
          <div className="bulk-checkin-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bulk-checkin-header">
              <h2>Bulk Check In Companions</h2>
              <p>
                Primary Attendee
                <strong>
                  {selectedAttendee.firstName} {selectedAttendee.lastName}
                </strong>
              </p>
            </div>
            {/* Summary */}
            <div className="bulk-summary">
              <div className="summary-card">
                <span>Total</span>
                <strong>
                  {selectedAttendee.companions.length}
                </strong>
              </div>
              <div className="summary-card-checkin">
                <span>Checked In</span>
                <strong>
                  {
                    selectedAttendee.companions.filter(
                      c => c.status === "CHECKED_IN"
                    ).length
                  }
                </strong>
              </div>
              <div className="summary-card-pending">
                <span>Pending</span>
                <strong>
                  {
                    selectedAttendee.companions.filter(
                      c => c.status !== "CHECKED_IN"
                    ).length
                  }
                </strong>
              </div>
            </div>
            {/* Select All */}
            <div className="bulk-select-all">
              <label>
                <input type="checkbox"
                checked={
                  selectedCompanions.length > 0 &&
                  selectedCompanions.length ===
                    selectedAttendee.companions.filter(
                      (c) => c.status !== "CHECKEDN _IN"
                    ).length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    const availableCompanions =
                      selectedAttendee.companions
                        .filter((c) => c.status !== "CHECKED_IN")
                        .map((c) => c.id);
                 setSelectedCompanions(availableCompanions);
                  }
                 else {
                  setSelectedCompanions([])
                 }   
                }}     
                        
                        />
                Select All Available
              </label>
            </div>
            {/* Companion List */}
            <div className="bulk-companion-list">
              {selectedAttendee.companions.map((companion) => (
                <div
                  key={companion.id}
                  className={`bulk-companion-card ${
                    companion.status === "CHECKED_IN"
                      ? "checked-in"
                      : ""
                  }`}
                >
                  <div className="bulk-checkbox">
                   <input
                        type="checkbox"
                        disabled={companion.status === "CHECKED_IN"}
                        checked={selectedCompanions.includes(companion.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCompanions((prev) => [
                              ...prev,
                              companion.id,
                            ]);
                          } else {
                            setSelectedCompanions((prev) =>
                              prev.filter((id) => id !== companion.id)
                            );
                          }
                        }}
                      />
                  </div>
                  <div className="bulk-info">
                    <h4>
                      {companion.firstName} {companion.lastName}
                    </h4>
                    <p>
                      {companion.position || "No Position"}
                    </p>
                    <span>
                      Check In Time:
                      {" "}
                      {companion.checkInAt
                        ? new Date(
                            companion.checkInAt
                          ).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                  <div className="bulk-status">
                    {companion.status === "CHECKED_IN" ? (
                        <span className="status-success">
                          ✔ Already Checked In
                        </span>
                      ) : selectedCompanions.includes(companion.id) ? (
                        <span className="status-selected">
                          ✓ Selected for Check In
                        </span>
                      ) : (
                        <span className="status-pending">
                          ● Pending Check In
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
{/* Footer */}
          <div className="bulk-checkin-footer">
            <button className="bulk-cancel-btn" onClick={() =>
                setShowBulkCheckInModal(false)
              }
            >
              Cancel
            </button>

            <button
                className="bulk-save-btn"
                onClick={handleBulkCheckIn}
            >
                Check In Selected ({selectedCompanions.length})
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
