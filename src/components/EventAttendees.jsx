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
  bulkAssignTable,
  confirmAttendee,
  declineAttendee,
  cancelAttendee,
  bulkConfirmAttendees,
  bulkCreateAttendees,
  distributeLootBag,
  distributeSouvenir,
  distributeDoorPrize,
} from "../services/attendeeListService";

import {
  getEventById,
  getBlockedEmails,
  addBlockedEmail,
  removeBlockedEmail,
} from "../services/eventService";
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
  QrCode,
  Folder,
  UsersIcon,
  FileUp,
  Gift,
  Ban,
  Trash2,
} from "lucide-react";

// ========================================
// GIVEAWAY CONFIGURATION
// ========================================
// Maps each giveaway type to:
// - the event flag that turns it on for this event (from CreateForm.jsx)
// - the attendee field that tells us it's already been distributed
// - the service call that marks it distributed
//
// Confirmed against the database schema (receivedLootBagAt /
// receivedSouvenirAt / receivedDoorPrizeAt — a nullable timestamp,
// set once the item is handed out).

const GIVEAWAY_TYPES = [
  {
    key: "lootBag",
    label: "Loot Bag",
    eventFlag: "includesLootBag",
    distributedFields: ["receivedLootBagAt"],
    action: distributeLootBag,
  },
  {
    key: "souvenir",
    label: "Souvenir",
    eventFlag: "includesSouvenir",
    distributedFields: ["receivedSouvenirAt"],
    action: distributeSouvenir,
  },
  {
    key: "doorPrize",
    label: "Door Prize",
    eventFlag: "includesDoorPrize",
    distributedFields: ["receivedDoorPrizeAt"],
    action: distributeDoorPrize,
  },
];

// Returns the distribution timestamp for this giveaway on the
// attendee record, or undefined if it hasn't been distributed yet.

const getGiveawayValue = (attendee, giveaway) => {
  if (!attendee) return undefined;

  for (const field of giveaway.distributedFields) {
    if (attendee[field]) {
      return attendee[field];
    }
  }

  return undefined;
};

// ========================================
// GIVEAWAY "DISTRIBUTED" CACHE (localStorage)
// ========================================
// Now that `receivedLootBagAt` / `receivedSouvenirAt` /
// `receivedDoorPrizeAt` are confirmed real fields, the API response
// is the source of truth and this cache is just a same-device,
// instant-UI bonus on top of it: it lets a card show "Distributed"
// the moment you click, and lets the QR Scanner page (a separate
// route/component) reflect a giveaway marked here without waiting on
// its own network round trip. Persisted per event so it survives
// navigating between this page and the scanner.
//
// Caveat: this is per-browser, not per-account, so it won't sync
// across two different devices/coordinators — only the real API
// response does that.

const giveawayCacheKey = (eventId) => `asc-giveaway-distributed:${eventId}`;

const loadGiveawayCache = (eventId) => {
  if (!eventId) return {};

  try {
    const raw = localStorage.getItem(giveawayCacheKey(eventId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveGiveawayCache = (eventId, cache) => {
  if (!eventId) return;

  try {
    localStorage.setItem(giveawayCacheKey(eventId), JSON.stringify(cache));
  } catch {
    // Ignore storage errors (private browsing, quota, etc.) — worst
    // case this just falls back to the in-memory state for this visit.
  }
};

const EventAttendees = () => {
const navigate = useNavigate();
const { eventId } = useParams();
const printRef = useRef();



// ========================================
// ATTENDEES
// ========================================

const [attendees, setAttendees] = useState([]);
const [loading, setLoading] = useState(false);

// ========================================
// FILTERS
// ========================================

const [search, setSearch] = useState("");
const [status, setStatus] = useState("");
const [role, setRole] = useState("");

// ========================================
// EVENT DETAILS
// ========================================

const [eventDetails, setEventDetails] = useState(null);

// ========================================
// PAGINATION
// ========================================

const [page, setPage] = useState(1);
const [limit] = useState(10);
const [totalPages, setTotalPages] = useState(1);
const [totalAttendees, setTotalAttendees] = useState(0);

// ========================================
// DASHBOARD SUMMARY
// ========================================

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
  if (!eventId) return;

  try {
    const response = await getDashboardSummary(eventId);

    console.log("Dashboard API:", response);

    setDashboard(
      response || {
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
      }
    );
  } catch (error) {
    console.error("Dashboard summary error:", error);
  }
};

// ========================================
// SELECTED ROWS
// ========================================

const [selectedRows, setSelectedRows] = useState([]);

// ========================================
// ATTENDEE DETAIL MODAL
// ========================================

const [selectedAttendee, setSelectedAttendee] = useState(null);

// ========================================
// PRIMARY / COMPANION MODAL
// ========================================

const [parentAttendee, setParentAttendee] = useState(null);
const [openedFromPrimary, setOpenedFromPrimary] = useState(false);

// ========================================
// TABLE ASSIGNMENT
// ========================================

const [showAssignForm, setShowAssignForm] = useState(false);
const [tableNumber, setTableNumber] = useState("");

const [showAssignModal, setShowAssignModal] = useState(false);

const [showCompanionAssignModal, setShowCompanionAssignModal] =
  useState(false);

const [selectedCompanion, setSelectedCompanion] = useState(null);

// ========================================
// SORTING
// ========================================

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

// ========================================
// TABS
// ========================================

const [activeTab, setActiveTab] = useState("details");

// ========================================
// CHECK IN
// ========================================

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
  if (!selectedAttendee) return;

  setEditingAttendee({
    ...selectedAttendee,
  });

  setShowEditAttendeeModal(true);
};

// ========================================
// UPDATE PRIMARY ATTENDEE
// ========================================

const handleUpdateAttendee = async () => {
  if (!editingAttendee?.id) {
    alert("No attendee selected.");
    return;
  }

  try {
    await updatePrimaryAttendee(editingAttendee.id, {
      firstName: editingAttendee.firstName,
      middleName: editingAttendee.middleName,
      lastName: editingAttendee.lastName,
      preferredNameOnBadge: editingAttendee.preferredNameOnBadge,
      emailAddress: editingAttendee.emailAddress,
      contactNumber: editingAttendee.contactNumber,
      company: editingAttendee.company,
      position: editingAttendee.position,
      mealPreference: editingAttendee.mealPreference,
    });

    // Refresh attendee list
    await fetchAttendees();

    // Refresh attendee details
    const updatedAttendee = await getAttendeeById(
      editingAttendee.id
    );

    setSelectedAttendee(updatedAttendee.data);

    setShowEditAttendeeModal(false);
    setEditingAttendee(null);

    alert("Attendee updated successfully!");
  } catch (error) {
    console.error("Update attendee error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to update attendee."
    );
  }
};

// ========================================
// ADD COMPANION MODAL
// ========================================

const [showAddCompanionModal, setShowAddCompanionModal] =
  useState(false);

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

// ========================================
// OPEN ADD COMPANION MODAL
// ========================================

const handleAddCompanion = () => {
  if (!selectedAttendee) {
    alert("Please select an attendee first.");
    return;
  }

  const existingCompanions =
    selectedAttendee?.companions?.length || 0;

  if (existingCompanions >= 5) {
    alert(
      "Maximum of 5 companions is allowed per primary attendee."
    );
    return;
  }

  setCompanions([{ ...emptyCompanion }]);

  console.log("EVENT OBJECT");
  console.log(selectedAttendee.event);

  setShowAddCompanionModal(true);
};

// ========================================
// ADD COMPANION FIELD
// ========================================

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

// ========================================
// REMOVE COMPANION FIELD
// ========================================

const handleRemoveCompanionField = (index) => {
  setCompanions((prev) => {
    if (prev.length === 1) {
      return prev;
    }

    return prev.filter((_, i) => i !== index);
  });
};

// ========================================
// UPDATE COMPANION FIELD
// ========================================

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

// ========================================
// SAVE COMPANION
// ========================================

const handleSaveCompanion = async () => {
  if (!selectedAttendee?.id) {
    alert("No primary attendee selected.");
    return;
  }

  try {
    const primaryId = selectedAttendee.id;

    const payload = companions.map((companion) => ({
      firstName: companion.firstName,
      lastName: companion.lastName,
      position: companion.position,
      preferredNameOnBadge:
        companion.preferredNameOnBadge,
      mealPreference: companion.mealPreference,
    }));

    for (const companion of payload) {
      await createCompanion(primaryId, companion);
    }

    // Refresh attendee list
    await fetchAttendees();

    // Refresh attendee details
    const updatedAttendee = await getAttendeeById(primaryId);

    setSelectedAttendee(updatedAttendee.data);

    setShowAddCompanionModal(false);

    setCompanions([
      {
        ...emptyCompanion,
      },
    ]);

    alert("Companion(s) added successfully!");
  } catch (error) {
    console.error("Create companion error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to create companion."
    );
  }
};

// ========================================
// EDIT COMPANION MODAL
// ========================================

const [showEditCompanionModal, setShowEditCompanionModal] =
  useState(false);

const [editingCompanion, setEditingCompanion] = useState(null);

// ========================================
// UPDATE COMPANION
// ========================================

const handleUpdateCompanion = async () => {
  if (!selectedAttendee?.id || !editingCompanion?.id) {
    alert("No companion selected.");
    return;
  }

  const payload = {
    firstName: editingCompanion.firstName,
    lastName: editingCompanion.lastName,
    preferredNameOnBadge:
      editingCompanion.preferredNameOnBadge,
    position: editingCompanion.position,
    mealPreference: editingCompanion.mealPreference,
  };

  try {
    await updateCompanions(
      selectedAttendee.id,
      editingCompanion.id,
      payload
    );

    // Refresh attendee list
    await fetchAttendees();

    // Refresh attendee details
    const updatedAttendee = await getAttendeeById(
      selectedAttendee.id
    );

    setSelectedAttendee(updatedAttendee.data);

    alert("Companion details updated successfully.");

    setShowEditCompanionModal(false);
    setEditingCompanion(null);
  } catch (error) {
    console.error("Update companion error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to update companion."
    );
  }
};

// ========================================
// BULK CHECK-IN MODAL
// ========================================

const [showBulkCheckInModal, setShowBulkCheckInModal] =
  useState(false);

const [selectedCompanions, setSelectedCompanions] = useState([]);

// ========================================
// OPEN BULK CHECK-IN
// ========================================

const handleOpenBulkCheckIn = () => {
  if (!selectedAttendee) {
    alert("Please select an attendee first.");
    return;
  }

  setSelectedCompanions([]);
  setShowBulkCheckInModal(true);
};

// ========================================
// BULK CHECK-IN
// ========================================

const handleBulkCheckIn = async () => {
  if (!selectedAttendee?.id) {
    alert("No attendee selected.");
    return;
  }

  if (selectedCompanions.length === 0) {
    alert("Please select at least one companion.");
    return;
  }

  try {
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

    // Refresh list + dashboard
    await Promise.all([
      fetchAttendees(),
      fetchDashboardSummary(),
    ]);

    // Refresh selected attendee
    const updatedAttendee = await getAttendeeById(
      selectedAttendee.id
    );

    setSelectedAttendee(updatedAttendee.data);

    setShowBulkCheckInModal(false);
    setSelectedCompanions([]);

    alert(
      response?.message ||
        "Attendees checked in successfully."
    );
  } catch (error) {
    console.error("Bulk Check In Error:", error);

    alert(
      error.response?.data?.message ||
        "Bulk check in failed."
    );
  }
};

// ========================================
// ASSIGN TABLE TO COMPANION
// ========================================

const handleAssignIndividualTable = async () => {
  if (!selectedCompanion) {
    alert("No companion selected.");
    return;
  }

  if (!tableNumber || Number(tableNumber) <= 0) {
    alert("Please enter a valid table number.");
    return;
  }

  try {
    setLoading(true);

    const response = await assignTable(
      selectedCompanion.id,
      Number(tableNumber)
    );

    // Refresh attendees + dashboard
    await Promise.all([
      fetchAttendees(),
      fetchDashboardSummary(),
    ]);

    // Update selected attendee modal
    setSelectedAttendee((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        companions:
          prev.companions?.map((companion) =>
            companion.id === selectedCompanion.id
              ? {
                  ...companion,
                  tableNumber: Number(tableNumber),
                }
              : companion
          ) || [],
      };
    });

    // Update selected companion
    setSelectedCompanion((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        tableNumber: Number(tableNumber),
      };
    });

    setShowCompanionAssignModal(false);
    setSelectedCompanion(null);
    setTableNumber("");

    alert(
      response?.message ||
        "Table assigned successfully."
    );
  } catch (error) {
    console.error("Assign table error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to assign table."
    );
  } finally {
    setLoading(false);
  }
};

// ========================================
// FETCH EVENT DETAILS
// ========================================

const fetchEventDetails = async () => {
  if (!eventId) return;

  try {
    const response = await getEventById(eventId);

    const event = response?.data;

    setEventDetails(event || null);
  } catch (error) {
    console.error("Fetch event details error:", error);
  }
};

// ========================================
// FETCH ATTENDEES
// ========================================

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
    console.log("Attendees:", response?.data);
    console.log("Pagination:", response?.pagination);

    setAttendees(response?.data || []);

    setTotalPages(
      response?.pagination?.totalPages || 1
    );

    setTotalAttendees(
      response?.pagination?.totalRecords || 0
    );
  } catch (error) {
    console.error("Fetch attendees error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to load attendees."
    );
  } finally {
    setLoading(false);
  }
};

// ========================================
// INITIAL / FILTER DATA FETCH
// ========================================

useEffect(() => {
  fetchEventDetails();
  fetchAttendees();
  fetchDashboardSummary();
}, [eventId, page, search, status, role]);

// ========================================
// VIEW ATTENDEE
// ========================================

const handleViewAttendee = async (attendeeId) => {
  if (!attendeeId) return;

  try {
    setLoading(true);

    const response = await getAttendeeById(attendeeId);

    console.log("FULL RESPONSE");
    console.log(response);

    console.log("ATTENDEE");
    console.log(response?.data);

    console.log("COMPANIONS");
    console.log(response?.data?.companions);

    setSelectedAttendee(response?.data || null);
    setActiveTab("details");
  } catch (error) {
    console.error(
      "Failed to fetch attendee details:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Unable to load attendee details."
    );
  } finally {
    setLoading(false);
  }
};

// ========================================
// VIEW COMPANION
// ========================================

const handleViewCompanion = async (attendeeId) => {
  if (!attendeeId) return;

  try {
    setLoading(true);

    // Save primary attendee
    setParentAttendee(selectedAttendee);

    // Mark nested modal
    setOpenedFromPrimary(true);

    const response = await getAttendeeById(attendeeId);

    setSelectedAttendee(response?.data || null);
    setActiveTab("details");
  } catch (error) {
    console.error(
      "Failed to fetch companion details:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Unable to load companion details."
    );
  } finally {
    setLoading(false);
  }
};

// ========================================
// CLOSE ATTENDEE MODAL
// ========================================

const handleCloseAttendeeModal = () => {
  setShowAssignForm(false);
  setTableNumber("");
  setActiveTab("details");

  if (openedFromPrimary && parentAttendee) {
    // Return to primary attendee
    setSelectedAttendee(parentAttendee);

    setParentAttendee(null);
    setOpenedFromPrimary(false);
  } else {
    // Close modal
    setSelectedAttendee(null);
  }
};

// ========================================
// ATTENDEE STATUS ACTIONS
// ========================================

const [statusMessage, setStatusMessage] = useState("");
const [confirmAction, setConfirmAction] = useState(null);

// ========================================
// CONFIRM ATTENDEE
// ========================================

const handleConfirmAttendee = async (id) => {
  if (!id) {
    alert("Invalid attendee.");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to confirm the attendance of this attendee?"
  );

  if (!confirmed) return;

  try {
    // Update backend
    await confirmAttendee(id);

    // Refresh attendee list
    await fetchAttendees();

    // Refresh dashboard
    await fetchDashboardSummary();

    // Refresh currently opened attendee
    const updatedAttendee = await getAttendeeById(id);

    if (updatedAttendee?.data) {
      setSelectedAttendee(updatedAttendee.data);
    }

    alert("Attendee confirmed successfully.");
  } catch (error) {
    console.error("Confirm failed:", error);

    alert(
      error.response?.data?.message ||
        "Failed to confirm attendee."
    );
  }
};

// ========================================
// DECLINE ATTENDEE
// ========================================

const handleDeclineAttendee = async (id) => {
  if (!id) {
    alert("Invalid attendee.");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to decline the registration of this attendee?"
  );

  if (!confirmed) return;

  try {
    // Update backend
    await declineAttendee(id);

    // Refresh attendee list
    await fetchAttendees();

    // Refresh dashboard
    await fetchDashboardSummary();

    /*
     * Declined attendees may be soft-deleted by the backend.
     * Close the modal instead of trying to load the attendee again.
     */
    setSelectedAttendee(null);

    alert("Attendee declined successfully.");
  } catch (error) {
    console.error("Decline failed:", error);

    alert(
      error.response?.data?.message ||
        "Failed to decline attendee."
    );
  }
};

// ========================================
// CANCEL ATTENDEE
// ========================================

const handleCancelAttendee = async (id) => {
  if (!id) {
    alert("Invalid attendee.");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to cancel the attendance of this attendee?"
  );

  if (!confirmed) return;

  try {
    // Update backend
    await cancelAttendee(id);

    // Refresh attendee list
    await fetchAttendees();

    // Refresh dashboard
    await fetchDashboardSummary();

    // Refresh currently opened attendee
    const updatedAttendee = await getAttendeeById(id);

    if (updatedAttendee?.data) {
      setSelectedAttendee(updatedAttendee.data);
    }

    alert("Attendee cancelled successfully.");
  } catch (error) {
    console.error("Cancel failed:", error);

    alert(
      error.response?.data?.message ||
        "Failed to cancel attendee."
    );
  }
};

// ========================================
// EXPORT ATTENDEES
// ========================================

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

  const csvContent = csvRows
    .map((row) =>
      row
        .map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `attendees-${eventId}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// ========================================
// BULK CONFIRM ATTENDEES
// ========================================

const [selectedAttendees, setSelectedAttendees] = useState([]);

const handleBulkConfirm = async () => {
  if (selectedRows.length === 0) {
    alert("Please select at least one attendee.");
    return;
  }

  const selectedAttendees = displayedAttendees.filter((attendee) =>
    selectedRows.includes(attendee.id)
  );

  const invalidAttendee = selectedAttendees.find(
    (attendee) => attendee.status !== "PENDING"
  );

  if (invalidAttendee) {
    const attendeeName = `${invalidAttendee.firstName} ${invalidAttendee.lastName}`;

    alert(
      `${attendeeName} is already ${invalidAttendee.status
        ?.replace("_", " ")
        .toLowerCase()}.`
    );

    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to confirm the attendance of ${selectedRows.length} selected attendee(s)?`
  );

  if (!confirmed) return;

  try {
    await bulkConfirmAttendees(selectedRows);

    await Promise.all([
      fetchAttendees(),
      fetchDashboardSummary(),
    ]);

    setSelectedRows([]);

    alert("Selected attendees confirmed successfully.");
  } catch (error) {
    console.error("Bulk confirm failed:", error);

    alert(
      error.response?.data?.message ||
        "Failed to confirm selected attendees."
    );
  }
};

const fileInputRef = useRef(null);

// ========================================
// BULK UPLOAD / IMPORT ATTENDEES
// ========================================

const [selectedFile, setSelectedFile] = useState(null);
const [uploading, setUploading] = useState(false);
const [importResult, setImportResult] = useState(null);
const [importError, setImportError] = useState("");


const handleFileChange = (event) => {
  const file = event.target.files?.[0];

  setImportError("");
  setImportResult(null);

  if (!file) {
    setSelectedFile(null);
    return;
  }

  const isExcelFile = file.name
    .toLowerCase()
    .endsWith(".xlsx");

  if (!isExcelFile) {
    setSelectedFile(null);

    setImportError(
      "Please select an Excel .xlsx file."
    );

    event.target.value = "";
    return;
  }

  setSelectedFile(file);
};


const uploadAttendeeFile = async (file) => {
  if (!eventId) {
    setImportError("Event ID is required.");
    return;
  }

  try {
    setUploading(true);
    setImportError("");
    setImportResult(null);

    console.log("Uploading attendee file...");
    console.log("Event ID:", eventId);
    console.log("File:", file.name);

    const response = await bulkCreateAttendees(
      eventId,
      file
    );

    console.log(
      "Bulk import response:",
      response
    );

    setImportResult(response);

    // Clear selected file after upload
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Refresh attendee list if available
    if (typeof fetchAttendees === "function") {
      await fetchAttendees();
    }

  } catch (error) {
    console.error(
      "Bulk import failed:",
      error
    );

    const response =
      error.response?.data;

    if (Array.isArray(response?.message)) {
      setImportError(
        response.message.join("\n")
      );
    } else {
      setImportError(
        response?.message ||
        "Failed to import attendees."
      );
    }

  } finally {
    setUploading(false);
  }
};

const handleBulkImport = async () => {
  if (!selectedFile) {
    setImportError(
      "Please select an .xlsx file first."
    );
    return;
  }

  if (!eventId) {
    setImportError(
      "Event ID is required."
    );
    return;
  }

  try {
    setUploading(true);
    setImportError("");
    setImportResult(null);

    console.log("Starting attendee import...");
    console.log("Event ID:", eventId);
    console.log("File:", selectedFile.name);

    const response = await bulkCreateAttendees(
      eventId,
      selectedFile
    );

    console.log(
      "Import result:",
      response
    );

    setImportResult(response);

    // Clear selected file
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

  } catch (error) {
    console.error(
      "Import failed:",
      error
    );

    const response =
      error.response?.data;

    if (Array.isArray(response?.message)) {
      setImportError(
        response.message.join("\n")
      );
    } else {
      setImportError(
        response?.message ||
          "Failed to import attendees."
      );
    }

  } finally {
    setUploading(false);
  }
};

const handleRemoveSelectedFile = () => {
  setSelectedFile(null);
  setImportError("");
  setImportResult(null);

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};
// ========================================
// BULK ASSIGN TABLE
// PRIMARY + COMPANIONS
// ========================================

const handleBulkAssignTable = async () => {
  if (!selectedAttendee?.id) {
    alert("Please select an attendee.");
    return;
  }

  if (!tableNumber || Number(tableNumber) <= 0) {
    alert("Please enter a valid table number.");
    return;
  }

  try {
    setLoading(true);

    console.log("Bulk Assigning Table:", {
      attendeeId: selectedAttendee.id,
      tableNumber: Number(tableNumber),
    });

    const response = await bulkAssignTable(
      selectedAttendee.id,
      Number(tableNumber)
    );

    console.log(
      "Bulk Assign Table Response:",
      response
    );

    // Refresh attendee list + dashboard
    await Promise.all([
      fetchAttendees(),
      fetchDashboardSummary(),
    ]);

    // Refresh selected attendee from backend
    const updatedAttendee = await getAttendeeById(
      selectedAttendee.id
    );

    setSelectedAttendee(updatedAttendee.data);

    // Close modal
    setShowAssignModal(false);

    // Reset input
    setTableNumber("");

    alert(
      response?.message ||
        "Table assigned successfully."
    );
  } catch (error) {
    console.error(
      "Bulk Assign Table Error:",
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

// ========================================
// CHECK IN
// ========================================

const handleCheckIn = async () => {
  if (!selectedAttendee?.id) {
    alert("Please select an attendee.");
    return;
  }

  try {
    setCheckingIn(true);

    const response = await checkInAttendee(
      selectedAttendee.id
    );

    if (response?.success) {
      // Refresh attendees + dashboard
      await Promise.all([
        fetchAttendees(),
        fetchDashboardSummary(),
      ]);

      // Refresh selected attendee
      const updatedAttendee = await getAttendeeById(
        selectedAttendee.id
      );

      console.log(
        "Updated Attendee:",
        updatedAttendee
      );

      setSelectedAttendee(updatedAttendee.data);

      setCheckInSuccess(true);

      alert(
        "Attendee checked in successfully!"
      );
    } else {
      alert(
        response?.message ||
          "Failed to check in attendee."
      );
    }
  } catch (error) {
    console.error("Check-in error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to check in attendee."
    );
  } finally {
    setCheckingIn(false);
  }
};

// ========================================
// GIVEAWAY DISTRIBUTION
// ========================================
// Marks a single giveaway (loot bag / souvenir / door prize) as
// distributed for the currently selected attendee. Mirrors the
// check-in flow above: call the PATCH endpoint, then refresh the
// list, dashboard, and the open attendee modal.

const [distributingGiveaway, setDistributingGiveaway] = useState(null);

// Instant-UI cache: remembers a giveaway as distributed the moment
// the PATCH succeeds (or the backend says it already happened), so
// the card updates immediately without waiting on the next fetch.
// Keyed as "<attendeeId>:<giveawayKey>". Seeded from localStorage (see
// loadGiveawayCache above) so a giveaway marked from the QR Scanner
// page shows as already distributed here too, without needing a page
// refresh.
const [locallyDistributed, setLocallyDistributed] = useState(() =>
  loadGiveawayCache(eventId)
);

// Marks a giveaway as distributed in both this component's state and
// the shared localStorage cache, so the QR Scanner page (and this
// page, next time it loads) immediately sees it as done too.
const markGiveawayDistributedLocally = (localKey) => {
  setLocallyDistributed((prev) => {
    const next = { ...prev, [localKey]: true };
    saveGiveawayCache(eventId, next);
    return next;
  });
};

const handleDistributeGiveaway = async (giveaway) => {
  if (!selectedAttendee?.id) {
    alert("Please select an attendee.");
    return;
  }

  const localKey = `${selectedAttendee.id}:${giveaway.key}`;

  try {
    setDistributingGiveaway(giveaway.key);

    await giveaway.action(selectedAttendee.id);

    markGiveawayDistributedLocally(localKey);

    // Refresh attendees + dashboard so the list/table and stats update
    // immediately — no page refresh needed.
    await Promise.all([
      fetchAttendees(),
      fetchDashboardSummary(),
    ]);

    // Refresh selected attendee so the modal reflects the update
    const updatedAttendee = await getAttendeeById(
      selectedAttendee.id
    );

    setSelectedAttendee(updatedAttendee.data);

    alert(`${giveaway.label} received successfully!`);
  } catch (error) {
    console.error(
      `Distribute ${giveaway.label} error:`,
      error
    );

    const serverMessage = error.response?.data?.message;

    // The backend rejected our PATCH because it was already marked
    // (e.g. a double-click, or the attendee was marked from another
    // screen a moment ago). Treat that as "already distributed"
    // rather than a hard failure, and refresh so the modal catches up
    // to the real state instead of staying stale until the next
    // manual reload.
    if (
      error.response?.status === 400 &&
      typeof serverMessage === "string" &&
      serverMessage.toLowerCase().includes("already")
    ) {
      markGiveawayDistributedLocally(localKey);

      try {
        const refreshedAttendee = await getAttendeeById(
          selectedAttendee.id
        );

        setSelectedAttendee(refreshedAttendee.data);
      } catch (refreshError) {
        console.warn(
          "Unable to refresh attendee after 'already distributed' response.",
          refreshError
        );
      }

      alert(serverMessage);
    } else {
      alert(
        serverMessage ||
          `Failed to mark ${giveaway.label} as distributed.`
      );
    }
  } finally {
    setDistributingGiveaway(null);
  }
};

// ========================================
// BLOCKED EMAILS (per event)
// ========================================
// Lets an admin block a specific email address from registering for
// this event, and view/remove entries in the current block list —
// all without leaving this dashboard (opened as a modal, same pattern
// as the Import Attendees modal above).

const [showBlockedEmailsModal, setShowBlockedEmailsModal] = useState(false);
const [blockedEmails, setBlockedEmails] = useState([]);
const [blockedEmailsLoading, setBlockedEmailsLoading] = useState(false);
const [blockedEmailsError, setBlockedEmailsError] = useState("");
const [newBlockedEmail, setNewBlockedEmail] = useState("");
const [addingBlockedEmail, setAddingBlockedEmail] = useState(false);
const [addBlockedEmailError, setAddBlockedEmailError] = useState("");
const [removingBlockedEmailId, setRemovingBlockedEmailId] = useState(null);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The shape of each entry in the GET response isn't confirmed yet — it
// may be a plain string (just the email) or an object with an id. This
// normalizes either shape so the rest of the UI has a consistent
// { id, email } to work with. If the backend returns objects, `id`
// falls back to the email itself when no separate identifier is present.
const normalizeBlockedEmail = (entry) => {
  if (typeof entry === "string") {
    return { id: entry, email: entry };
  }

  const email =
    entry?.email || entry?.emailAddress || entry?.address || "";

  return {
    id: entry?.id || entry?._id || email,
    email,
  };
};

const fetchBlockedEmails = async () => {
  try {
    setBlockedEmailsLoading(true);
    setBlockedEmailsError("");

    const response = await getBlockedEmails(eventId);

    // Defensive: accept an array directly, or an array nested under a
    // common wrapper key, depending on what the backend actually sends.
    const list = Array.isArray(response)
      ? response
      : response?.data || response?.blockedEmails || response?.emails || [];

    setBlockedEmails(list.map(normalizeBlockedEmail));
  } catch (error) {
    console.error("Fetch Blocked Emails Error:", error);
    setBlockedEmailsError(
      error.response?.data?.message ||
        "Failed to load blocked emails for this event."
    );
  } finally {
    setBlockedEmailsLoading(false);
  }
};

const handleOpenBlockedEmailsModal = () => {
  setShowBlockedEmailsModal(true);
  setNewBlockedEmail("");
  setAddBlockedEmailError("");
  fetchBlockedEmails();
};

const handleCloseBlockedEmailsModal = () => {
  setShowBlockedEmailsModal(false);
};

const handleAddBlockedEmail = async (e) => {
  e.preventDefault();

  const email = newBlockedEmail.trim().toLowerCase();

  if (!email) {
    setAddBlockedEmailError("Please enter an email address.");
    return;
  }

  if (!emailRegex.test(email)) {
    setAddBlockedEmailError("Please enter a valid email address.");
    return;
  }

  if (
    blockedEmails.some(
      (entry) => entry.email.toLowerCase() === email
    )
  ) {
    setAddBlockedEmailError("This email is already blocked for this event.");
    return;
  }

  try {
    setAddingBlockedEmail(true);
    setAddBlockedEmailError("");

    await addBlockedEmail(eventId, email);

    setNewBlockedEmail("");
    await fetchBlockedEmails();
  } catch (error) {
    console.error("Add Blocked Email Error:", error);
    setAddBlockedEmailError(
      error.response?.data?.message || "Failed to block this email."
    );
  } finally {
    setAddingBlockedEmail(false);
  }
};

const handleRemoveBlockedEmail = async (entry) => {
  try {
    setRemovingBlockedEmailId(entry.id);

    await removeBlockedEmail(eventId, entry.id);

    setBlockedEmails((prev) =>
      prev.filter((item) => item.id !== entry.id)
    );
  } catch (error) {
    console.error("Remove Blocked Email Error:", error);
    alert(
      error.response?.data?.message ||
        `Failed to unblock ${entry.email}.`
    );
  } finally {
    setRemovingBlockedEmailId(null);
  }
};

// ========================================
// DISPLAYED ATTENDEES
// ========================================

const displayedAttendees = [...attendees]
  .filter((attendee) => {
    // -----------------------------
    // ROLE FILTER
    // -----------------------------

    if (
      role &&
      attendee.role?.toUpperCase() !==
        role.toUpperCase()
    ) {
      return false;
    }

    // -----------------------------
    // SEARCH FILTER
    // -----------------------------

    if (search) {
      const keyword = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        attendee.firstName
          ?.toLowerCase()
          .includes(keyword) ||
        attendee.lastName
          ?.toLowerCase()
          .includes(keyword) ||
        attendee.emailAddress
          ?.toLowerCase()
          .includes(keyword) ||
        attendee.company
          ?.toLowerCase()
          .includes(keyword);

      if (!matchesSearch) {
        return false;
      }
    }

    // -----------------------------
    // STATUS FILTER
    // -----------------------------

    if (
      status &&
      attendee.status?.toUpperCase() !==
        status.toUpperCase()
    ) {
      return false;
    }

    return true;
  })
  .sort((a, b) => {
    if (!sortField) {
      return 0;
    }

    let valueA = a[sortField];
    let valueB = b[sortField];

    // Handle null / undefined
    valueA = valueA ?? "";
    valueB = valueB ?? "";

    // Numeric sorting
    if (
      typeof valueA === "number" &&
      typeof valueB === "number"
    ) {
      return sortOrder === "asc"
        ? valueA - valueB
        : valueB - valueA;
    }

    // String sorting
    valueA = String(valueA).toLowerCase();
    valueB = String(valueB).toLowerCase();

    if (valueA < valueB) {
      return sortOrder === "asc" ? -1 : 1;
    }

    if (valueA > valueB) {
      return sortOrder === "asc" ? 1 : -1;
    }

    return 0;
  });
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
          {/* <span>{dashboard.checkIn.rate}% Check-in Rate</span> */}
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
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="DECLINED">Declined</option>
            <option value="CANCELLED">Cancelled</option>

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
          <button
            className="red-btn"
            onClick={() => navigate(`/attendees/${eventId}/scanner`)}>
             <QrCode size={17} />
            QR Scanner
          </button>


          <button
            className="orange-btn"
            onClick={() => navigate(`/event-reports/${eventId}`)}>
             <Folder size={17} />
            Reports
          </button>

{/* ========================================
    IMPORT ATTENDEES BUTTON
======================================== */}

<button
  type="button"
  className="blue-btn"
  onClick={() => fileInputRef.current?.click()}
  disabled={uploading}
>
  <FileUp size={17} />
  {uploading ? "Importing..." : "Import Attendees"}
</button>

<input
  ref={fileInputRef}
  type="file"
  accept=".xlsx"
  onChange={handleFileChange}
  style={{ display: "none" }}
/>

{/* ========================================
    BLOCKED EMAILS BUTTON
======================================== */}

<button
  type="button"
  className="red-btn"
  onClick={handleOpenBlockedEmailsModal}
>
  <Ban size={17} />
  Blocked Emails
</button>


{/* ========================================
    IMPORT MODAL
======================================== */}

{(selectedFile || uploading || importResult || importError) && (
  <div className="import-modal-overlay">

    <div className="import-modal">

      {/* HEADER */}
      <div className="import-modal-header">
        <div>
          <h2>Import Attendees</h2>
          <p>
            Upload an Excel spreadsheet to add attendees
            to this event.
          </p>
        </div>

        {!uploading && (
          <button
            type="button"
            className="import-modal-close"
            onClick={handleRemoveSelectedFile}
          >
            ×
          </button>
        )}
      </div>


      {/* BODY */}
      <div className="import-modal-body">

        {/* SELECTED FILE */}
        {selectedFile && !importResult && (
          <div className="import-file-card">

            <div className="import-file-icon">
              <FileUp size={24} />
            </div>

            <div className="import-file-details">
              <strong>
                {selectedFile.name}
              </strong>

              <span>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>

          </div>
        )}


        {/* UPLOADING */}
        {uploading && (
          <div className="import-progress-container">

            <div className="import-progress-header">
              <span>
                Importing attendees...
              </span>

              <span>
                Please wait
              </span>
            </div>

            <div className="import-progress-bar">
              <div className="import-progress-fill"></div>
            </div>

            <p>
              The system is processing your Excel
              spreadsheet. Please do not close this window.
            </p>

          </div>
        )}


        {/* ERROR */}
        {importError && !uploading && (
          <div className="import-error-box">

            <div className="import-error-title">
              Import Failed
            </div>

            <div className="import-error-message">
              {importError}
            </div>

          </div>
        )}


        {/* RESULT */}
        {importResult && !uploading && (
          <div className="import-result-container">

            <div className="import-success-icon">
              ✓
            </div>

            <h3>
              Import Completed
            </h3>

            <p className="import-result-message">
              {importResult.message}
            </p>


            {/* SUMMARY */}
            <div className="import-summary">

              <div className="import-summary-card">
                <strong>
                  {importResult.inserted ?? 0}
                </strong>

                <span>
                  Imported
                </span>
              </div>

              <div className="import-summary-card">
                <strong>
                  {importResult.queued ?? 0}
                </strong>

                <span>
                  Queued
                </span>
              </div>

              <div className="import-summary-card">
                <strong>
                  {importResult.skipped ?? 0}
                </strong>

                <span>
                  Skipped
                </span>
              </div>

            </div>


            {/* ROW ERRORS */}
            {importResult.errors?.length > 0 && (
              <div className="import-errors-list">

                <h4>
                  Rows that need correction
                </h4>

                <div className="import-errors-scroll">

                  {importResult.errors.map(
                    (item, index) => (
                      <div
                        key={`${item.row}-${index}`}
                        className="import-row-error"
                      >

                        <span className="import-row-number">
                          Row {item.row}
                        </span>

                        <span className="import-row-reason">
                          {item.reason}
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          </div>
        )}

      </div>


      {/* FOOTER */}
      {!uploading && (
        <div className="import-modal-footer">

          {!importResult && selectedFile && (
            <>
              <button
                type="button"
                className="import-cancel-btn"
                onClick={handleRemoveSelectedFile}
              >
                Cancel
              </button>

              <button
                type="button"
                className="blue-btn"
                onClick={() =>
                  uploadAttendeeFile(selectedFile)
                }
              >
                <FileUp size={17} />
                Start Import
              </button>
            </>
          )}

          {(importResult || importError) && (
            <button
              type="button"
              className="blue-btn"
              onClick={handleRemoveSelectedFile}
            >
              Done
            </button>
          )}

        </div>
      )}

    </div>
  </div>
)}

{/* ========================================
    BLOCKED EMAILS MODAL
======================================== */}

{showBlockedEmailsModal && (
  <div className="import-modal-overlay">
    <div className="import-modal blocked-emails-modal">

      {/* HEADER */}
      <div className="import-modal-header">
        <div>
          <h2>Blocked Emails</h2>
          <p>
            Block an email address from registering for this event,
            or remove one from the block list.
          </p>
        </div>

        <button
          type="button"
          className="import-modal-close"
          onClick={handleCloseBlockedEmailsModal}
        >
          ×
        </button>
      </div>

      {/* BODY */}
      <div className="import-modal-body">

        {/* ADD FORM */}
        <form
          className="blocked-email-form"
          onSubmit={handleAddBlockedEmail}
        >
          <input
            type="email"
            placeholder="name@example.com"
            value={newBlockedEmail}
            onChange={(e) => {
              setNewBlockedEmail(e.target.value);
              if (addBlockedEmailError) setAddBlockedEmailError("");
            }}
            disabled={addingBlockedEmail}
          />

          <button
            type="submit"
            className="red-btn"
            disabled={addingBlockedEmail}
          >
            <Ban size={16} />
            {addingBlockedEmail ? "Blocking..." : "Block Email"}
          </button>
        </form>

        {addBlockedEmailError && (
          <div className="import-error-box">
            <div className="import-error-message">
              {addBlockedEmailError}
            </div>
          </div>
        )}

        {/* LIST */}
        <div className="blocked-email-list-wrapper">
          {blockedEmailsLoading && (
            <p className="blocked-email-status">
              Loading blocked emails...
            </p>
          )}

          {!blockedEmailsLoading && blockedEmailsError && (
            <div className="import-error-box">
              <div className="import-error-message">
                {blockedEmailsError}
              </div>
            </div>
          )}

          {!blockedEmailsLoading &&
            !blockedEmailsError &&
            blockedEmails.length === 0 && (
              <p className="blocked-email-status">
                No emails are blocked for this event yet.
              </p>
            )}

          {!blockedEmailsLoading &&
            !blockedEmailsError &&
            blockedEmails.length > 0 && (
              <ul className="blocked-email-list">
                {blockedEmails.map((entry) => (
                  <li key={entry.id} className="blocked-email-item">
                    <span>{entry.email}</span>

                    <button
                      type="button"
                      className="icon-btn danger"
                      title={`Unblock ${entry.email}`}
                      onClick={() => handleRemoveBlockedEmail(entry)}
                      disabled={removingBlockedEmailId === entry.id}
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </div>

      </div>

      {/* FOOTER */}
      <div className="import-modal-footer">
        <button
          type="button"
          className="import-cancel-btn"
          onClick={handleCloseBlockedEmailsModal}
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}







          <div
              title={
                selectedRows.length === 0
                  ? "Please select attendee first"
                  : ""
              }
            >
              <button
                type="button"
                onClick={handleBulkConfirm}
                disabled={selectedRows.length === 0}
                className={`green-btn ${
                  selectedRows.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <UsersIcon size={17} />
                Bulk Confirm ({selectedRows.length})
              </button>


          </div>
        </div>
      </div>
      {/* Table */}
<div className="modern-table-wrapper">
  <div className="table-scroll" ref={printRef}>
    <table className="modern-table">
  <thead>
    <tr>
      {/* Select All Checkbox */}
      <th className="w-12 px-4 py-3 text-center">
        {!loading &&
          displayedAttendees.filter(
            (attendee) => attendee.status === "PENDING"
          ).length > 0 && (
            <input
              type="checkbox"
              checked={
                displayedAttendees.filter(
                  (attendee) => attendee.status === "PENDING"
                ).length > 0 &&
                displayedAttendees
                  .filter(
                    (attendee) => attendee.status === "PENDING"
                  )
                  .every((attendee) =>
                    selectedRows.includes(attendee.id)
                  )
              }
              onChange={(e) => {
                const pendingAttendees = displayedAttendees.filter(
                  (attendee) => attendee.status === "PENDING"
                );

                if (e.target.checked) {
                  setSelectedRows(
                    pendingAttendees.map(
                      (attendee) => attendee.id
                    )
                  );
                } else {
                  setSelectedRows([]);
                }
              }}
              className="h-4 w-4 cursor-pointer accent-red-600"
            />
          )}
      </th>

      {/* Name */}
      <th onClick={() => handleSort("firstName")}>
        <div className="th-content">
          Name
          <ArrowUpDown size={13} />
        </div>
      </th>

      {/* Email */}
      <th onClick={() => handleSort("emailAddress")}>
        <div className="th-content">
          Email
          <ArrowUpDown size={13} />
        </div>
      </th>

      {/* Company */}
      <th onClick={() => handleSort("company")}>
        <div className="th-content">
          Company
          <ArrowUpDown size={13} />
        </div>
      </th>

      {/* Position */}
      <th onClick={() => handleSort("position")}>
        <div className="th-content">
          Position
          <ArrowUpDown size={13} />
        </div>
      </th>

      {/* Status */}
      <th onClick={() => handleSort("status")}>
        <div className="th-content">
          Status
          <ArrowUpDown size={13} />
        </div>
      </th>

      {/* Table Number */}
      <th onClick={() => handleSort("tableNumber")}>
        <div className="th-content">
          Table No.
          <ArrowUpDown size={13} />
        </div>
      </th>

      {/* Meal */}
      <th onClick={() => handleSort("mealPreference")}>
        <div className="th-content">
          Meal
          <ArrowUpDown size={13} />
        </div>
      </th>

      {/* Role */}
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
              className="h-4 w-4 cursor-pointer accent-red-600"
              checked={selectedRows.includes(attendee.id)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedRows((prev) => [
                    ...prev,
                    attendee.id,
                  ]);
                } else {
                  setSelectedRows((prev) =>
                    prev.filter((id) => id !== attendee.id)
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
                  {attendee.firstName}{" "}
                  {attendee.lastName}
                </div>
              </div>
            </div>
          </td>

          {/* Email */}
          <td>
            {attendee.emailAddress || "-"}
          </td>

          {/* Company */}
          <td>
            {attendee.company || "-"}
          </td>

          {/* Position */}
          <td>
            {attendee.position || "-"}
          </td>

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
          <td>
            {attendee.tableNumber || "Not Assigned"}
          </td>

          {/* Meal */}
          <td>
            {attendee.mealPreference || "Not Assigned"}
          </td>

          {/* Role */}
          <td>
            {attendee.role || "Not Assigned"}
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>
      </div>
    </div>
 {/* Import Attendee Results Modal */}
    {importResult && (
  <div className="import-result">
    <h3>Import Results</h3>

    <p>
      {importResult.message}
    </p>

    <div className="import-summary">
      <div>
        <strong>
          {importResult.inserted}
        </strong>
        <span>Imported</span>
      </div>

      <div>
        <strong>
          {importResult.queued}
        </strong>
        <span>Queued</span>
      </div>

      <div>
        <strong>
          {importResult.skipped}
        </strong>
        <span>Skipped</span>
      </div>
    </div>

    {importResult.errors?.length > 0 && (
      <div className="import-errors">
        <h4>
          Rows that need correction
        </h4>

        {importResult.errors.map(
          (error, index) => (
            <div
              key={`${error.row}-${index}`}
              className="import-error-row"
            >
              <strong>
                Row {error.row}
              </strong>

              <span>
                {error.reason}
              </span>
            </div>
          )
        )}
      </div>
    )}
  </div>
)}
 {/* Attendee Modal */}
      {selectedAttendee && (
        <div
          className="attendee-modal-overlay"
          onClick={handleCloseAttendeeModal}
        >
          <div className="attendee-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="attendee-modal-header">
              <h2>Attendee Details</h2>

              <button
                className="close-icon"
                onClick={handleCloseAttendeeModal}
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

                      {/* ATTENDEE ACTION BUTTONS BASED ON THE CURRENT STATUS */}
                        {selectedAttendee.status === "PENDING" && (
                          <>
                            <label>Actions</label>

                            <div className="attendee-actions">
                              <button
                                className="confirm-attendee-btn"
                                onClick={() => handleConfirmAttendee(selectedAttendee.id)}
                              >
                                Confirm
                              </button>

                              <button
                                className="decline-attendee-btn"
                                onClick={() => handleDeclineAttendee(selectedAttendee.id)}
                              >
                                Decline
                              </button>

                              <button
                                className="cancel-attendee-btn"
                                onClick={() => handleCancelAttendee(selectedAttendee.id)}
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        )}


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

                  {/* ========================================
                      GIVEAWAY DISTRIBUTION
                      Only shown for giveaway types this event
                      was configured with in CreateForm.jsx
                  ======================================== */}

                  {GIVEAWAY_TYPES.some(
                    (giveaway) => eventDetails?.[giveaway.eventFlag]
                  ) && (
                    <>
                      <hr className="section-divider" />
                      <h3>Giveaways</h3>

                      <div className="giveaway-grid">
                        {GIVEAWAY_TYPES.filter(
                          (giveaway) => eventDetails?.[giveaway.eventFlag]
                        ).map((giveaway) => {
                          const giveawayValue = getGiveawayValue(
                            selectedAttendee,
                            giveaway
                          );

                          const distributed =
                            Boolean(giveawayValue) ||
                            Boolean(
                              locallyDistributed[
                                `${selectedAttendee?.id}:${giveaway.key}`
                              ]
                            );

                          const isSaving =
                            distributingGiveaway === giveaway.key;

                          return (
                            <div
                              key={giveaway.key}
                              className={`giveaway-card ${
                                distributed ? "distributed" : ""
                              }`}
                            >
                              <div className="giveaway-card-info">
                                <Gift size={20} />

                                <div>
                                  <strong>{giveaway.label}</strong>

                                  <span>
                                    {distributed
                                      ? `Distributed${
                                          typeof giveawayValue === "string"
                                            ? ` on ${new Date(
                                                giveawayValue
                                              ).toLocaleString()}`
                                            : ""
                                        }`
                                      : "Not yet distributed"}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                className="giveaway-distribute-btn"
                                disabled={distributed || isSaving}
                                onClick={() =>
                                  handleDistributeGiveaway(giveaway)
                                }
                              >
                                {distributed
                                  ? "Distributed"
                                  : isSaving
                                    ? "Marking..."
                                    : "Mark Distributed"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
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

                                   console.log("Selected Companion:", companion);

                                  setSelectedCompanion(companion);

                                  setTableNumber(companion.tableNumber || "");

                                  setShowCompanionAssignModal(true);
                              }}
                          >

                              {companion.tableNumber ? "Change Table" : "Assign Table"}
                            </button>

                            <button
                                type="button"
                                className="edit-companion-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewCompanion(companion.id);
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
                        onClick={handleBulkAssignTable}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>


            {/* ========================================
                ASSIGN TABLE MODAL FOR COMPANION
            ======================================== */}

            {showCompanionAssignModal && (
                <div
                  className="modal-overlay"
                  onClick={() => setShowCompanionAssignModal(false)}
                >
                  <div
                    className="assign-table-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2>Assign Table</h2>

                    <p className="assign-subtitle">
                      {selectedCompanion?.firstName} {selectedCompanion?.lastName}
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
                        onClick={() => {
                            setShowCompanionAssignModal(false);
                            setSelectedCompanion(null);
                            setTableNumber("");
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        className="save-table-btn"
                        onClick={handleAssignIndividualTable}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}


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

              <div className="summary-card-total">
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