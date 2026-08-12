import "./EventReports.css";

import {
  FileBarChart2,
  CalendarRange,
  Users,
  UserCheck,
  UserX,
  Armchair,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    generateAttendeeReport,
    getAttendees,
} from "../services/attendeeListService";




export default function EventReports() {

const { eventId } = useParams();
const [eventDetails, setEventDetails] = useState(null);
const [exporting, setExporting] = useState(false);


//For Summary Cards Data
const [attendees, setAttendees] = useState([]);
const [loadingAttendees, setLoadingAttendees] = useState(true);

const navigate = useNavigate();
 
// =========== FETCH ATTENDEES FOR SUMMARY CARDS ====//
useEffect(() => {

    const fetchAttendees = async () => {

        if (!eventId) {
            console.error("Event ID is missing.");
            return;
        }

        try {

            setLoadingAttendees(true);

            const response = await getAttendees({
                eventId: eventId,
                page: 1,
                limit: 100,
                search: "",
                status: ""
            });

            console.log(
                "========== REPORT ATTENDEES =========="
            );

            console.log(response);

            const attendeeData =
                response?.data || [];

            console.log(
                "Attendees:",
                attendeeData
            );

            console.log(
                "Total:",
                response?.pagination?.totalRecords
            );

            setAttendees(attendeeData);

        } catch (error) {

            console.error(
                "Fetch Report Attendees Error:",
                error.response?.data || error
            );

            setAttendees([]);

        } finally {

            setLoadingAttendees(false);

        }

    };

    fetchAttendees();

}, [eventId]);
//========== CALCULATE SUMMARY ===========


    const totalRegistered =
        attendees.length;

    const checkedInCount =
        attendees.filter(
            (attendee) =>
                attendee.checkInAt ||
                attendee.status === "CHECKED_IN"
        ).length;

    const pendingCount =
        totalRegistered - checkedInCount;

    const assignedTables =
        new Set(
            attendees
                .map(
                    (attendee) =>
                        attendee.tableNumber
                )
                .filter(
                    (tableNumber) =>
                        tableNumber !== null &&
                        tableNumber !== undefined &&
                        tableNumber !== ""
                )
        );

    const tablesAssigned =
        assignedTables.size;

    const checkedInPercentage =
        totalRegistered > 0
            ? (
                (checkedInCount /
                    totalRegistered) *
                100
            ).toFixed(1)
            : "0.0";

    const pendingPercentage =
        totalRegistered > 0
            ? (
                (pendingCount /
                    totalRegistered) *
                100
            ).toFixed(1)
            : "0.0";




//============== HANDLE EXPORT =================//

const handleExportExcel = async () => {
        if (!eventId) {
            alert("Event ID is missing.");
            return;
        }
        try {
            setExporting(true);
            const response =
                await generateAttendeeReport(eventId);
            const blob = new Blob(
                [response.data],
                {
                    type:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            );
            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `attendee-report-${eventId}.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
       } catch (error) {

    console.error(
        "========== EXPORT EXCEL ERROR =========="
    );

    console.error("Error:", error);
    console.error("Response:", error.response);
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);

    alert(
        `Unable to generate the attendee report.\n\nStatus: ${
            error.response?.status || "Unknown"
        }`
    );

} finally {
    setExporting(false);
}
    };

// ============= Fetch data from database to tables ============//
const checkedInAttendees =
    attendees.filter(
        (attendee) =>
            attendee.checkInAt ||
            attendee.status === "CHECKED_IN"
    );

const pendingAttendees =
    attendees.filter(
        (attendee) =>
            !attendee.checkInAt &&
            attendee.status !== "CHECKED_IN"
    );

const tableAssignedAttendees =
    attendees.filter(
        (attendee) =>
            attendee.tableNumber !== null &&
            attendee.tableNumber !== undefined &&
            attendee.tableNumber !== ""
    );


 // =========== Calculate attendees assigned per table ======= //
 
 const tableAssignments = Object.values(
    attendees.reduce((tables, attendee) => {

        const tableNumber =
            attendee.tableNumber || "Unassigned";

        if (!tables[tableNumber]) {
            tables[tableNumber] = {
                tableNumber,
                attendeeCount: 0
            };
        }

        tables[tableNumber].attendeeCount++;

        return tables;

    }, {})
).sort((a, b) => {

    if (a.tableNumber === "Unassigned") {
        return 1;
    }

    if (b.tableNumber === "Unassigned") {
        return -1;
    }

    return Number(a.tableNumber) - Number(b.tableNumber);

});


  return (
    <div className="event-reports-page">
   {/* ==========HEADER===============*/}
      <div className="reports-header">
            <button className="reports-back-button"
            onClick={() =>
                    navigate(
                         `/attendees/${eventId}`
                            )}>
                <ArrowLeft size={18} />
                <span>Back</span>
            </button>
            <div className="reports-title">
                <div className="reports-icon">
                    <FileBarChart2 size={28} />
                </div>
                <div className="reports-title-content">
                    <h1>Event Reports</h1>
                    <p>
                        View attendance reports and export event and attendees data.
                    </p>
                </div>
            </div>
        </div>
      {/* ==========SUMMARY CARD==============*/}
     
       <div className="reports-summary-grid">
            {/* TOTAL REGISTERED */}

            <div className="reports-summary-card">
                <div className="reports-summary-icon registered">
                    <Users size={22} />
                </div>
                <div className="reports-summary-content">
                    <span className="reports-summary-label">
                        Total Registered
                    </span>
                         <h2>
                            {loadingAttendees
                                ? "—"
                                : totalRegistered.toLocaleString()
                            }
                        </h2>
                    <span className="reports-summary-subtext">
                        All attendees
                    </span>
                    
                </div>
            </div>

            {/* CHECKED IN */}

            <div className="reports-summary-card">
                <div className="reports-summary-icon checked">
                    <UserCheck size={22} />
                </div>
                <div className="reports-summary-content">
                    <span className="reports-summary-label">
                        Checked In
                    </span>
                    <h2>
                     {loadingAttendees
                            ? "—"
                            : checkedInCount.toLocaleString()
                        }
                    </h2>
                    <span className="reports-summary-subtext">
                       {checkedInPercentage}% of total
                    </span>
                </div>
            </div>

            {/* PENDING */}

            <div className="reports-summary-card">
                <div className="reports-summary-icon pending">
                    <UserX size={22} />
                </div>
                <div className="reports-summary-content">
                    <span className="reports-summary-label">
                        Pending Check-in
                    </span>
                    <h2>
                    {loadingAttendees
                        ? "—"
                        : pendingCount.toLocaleString()
                    }
                    </h2>
                    <span className="reports-summary-subtext">
                        {pendingPercentage}% of total
                    </span>
                </div>
            </div>

        {/* TABLES */}
        
            <div className="reports-summary-card">
                <div className="reports-summary-icon tables">
                    <Armchair size={22} />
                </div>
                <div className="reports-summary-content">
                    <span className="reports-summary-label">
                        Tables Assigned
                    </span>
                    <h2>
                     {loadingAttendees
                    ? "—"
                    : tablesAssigned}
                    </h2>

                    <span className="reports-summary-subtext">
                        Assigned tables
                    </span>
                </div>
            </div>

        </div>

        {/* =========================================================
                AVAILABLE REPORTS / EXPORT TOOLBAR
            ========================================================= */}

                <div className="reports-export-section">

                    <div className="reports-export-header">

                        <div className="reports-export-title">

                            <div className="reports-export-icon">
                                <FileBarChart2 size={22} />
                            </div>

                            <div>
                                <h2>
                                    Export Attendee Report
                                </h2>

                                <p>
                                    Download the complete event attendance report in Excel format.
                                </p>
                            </div>

                        </div>

                        <div className="reports-export-actions">

                            <button
                                type="button"
                                className="reports-export-button"
                                onClick={handleExportExcel}
                                disabled={exporting}
                            >
                                <FileBarChart2 size={18} />

                                {exporting
                                    ? "Generating Report..."
                                    : "Export Excel"
                                }
                            </button>

                        </div>

                    </div>


                    {/* REPORT CONTENT INCLUDED */}

                    <div className="reports-export-included">

                        <div className="export-included-title">
                            Report includes:
                        </div>

                        <div className="export-included-list">

                            <div className="export-included-item">
                                <UserCheck size={18} />
                                <div>
                                    <strong>
                                        Summary
                                    </strong>
                                    <span>
                                        Registration and check-in statistics
                                    </span>
                                </div>
                            </div>


                            <div className="export-included-item">
                                <Users size={18} />
                                <div>
                                    <strong>
                                        Attendees
                                    </strong>
                                    <span>
                                        Complete attendee and companion listing
                                    </span>
                                </div>
                            </div>


                            <div className="export-included-item">
                                <Armchair size={18} />
                                <div>
                                    <strong>
                                        Table Assignments
                                    </strong>
                                    <span>
                                        Attendees seated per table
                                    </span>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            
            {/* =========================================================
                    SUCCESSFULLY CHECKED-IN
                ========================================================= */}
                <div className="report-section">
                    <div className="report-section-header">
                        <div className="report-section-title">
                            <div className="report-section-icon success">
                                <UserCheck size={20} />
                            </div>
                            <div>
                                <h2>
                                    Successfully Checked-In
                                </h2>
                                <p>
                                    Attendees who have successfully checked in.
                                </p>
                            </div>
                        </div>
                        <span className="report-section-count success">
                            {checkedInAttendees.length} Attendees
                        </span>
                    </div>


                    {/* TABLE */}
                    <div className="report-table-wrapper">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Company
                                    </th>

                                    <th>
                                        Position
                                    </th>

                                    <th>
                                        Check-in Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingAttendees ? (
                                    <tr>
                                        <td colSpan="4" className="empty-table">
                                            Loading attendees...
                                        </td>
                                    </tr>

                                ) : checkedInAttendees.length === 0 ? (

                                    <tr>
                                        <td colSpan="4" className="empty-table">
                                            <div className="report-empty-state">
                                                <UserCheck size={32} />

                                                <strong>
                                                    No checked-in attendees
                                                </strong>

                                                <span>
                                                    Checked-in attendees will appear here.
                                                </span>
                                            </div>
                                        </td>
                                    </tr>

                                ) : (

                                    checkedInAttendees.map(
                                        (attendee) => (
                                            

                                            <tr key={attendee.id}>

                                                <td>
                                                    {attendee.firstName}{" "}
                                                    {attendee.lastName}
                                                </td>

                                                <td>
                                                    {attendee.company || "-"}
                                                </td>

                                                <td>
                                                    {attendee.position || "-"}
                                                </td>

                                                <td>
                                                    {attendee.checkInAt
                                                        ? new Date(
                                                            attendee.checkInAt
                                                        ).toLocaleString()
                                                        : "-"}
                                                </td>
                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>
                        </table>
                    </div>
                </div>
                {/* =========================================================
                        PENDING CHECK-IN
                    ========================================================= */}
                    <div className="report-section">
                        <div className="report-section-header">
                            <div className="report-section-title">
                                <div className="report-section-icon pending">
                                    <UserX size={20} />
                                </div>
                                <div>
                                    <h2>
                                        Pending Check-in
                                    </h2>
                                    <p>
                                        Attendees who have not checked in yet.
                                    </p>
                                </div>
                            </div>
                            <span className="report-section-count pending">
                                {pendingAttendees.length} Attendees
                            </span>
                        </div>

                        {/* TABLE */}
                        <div className="report-table-wrapper">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Name
                                        </th>
                                        <th>
                                            Company
                                        </th>
                                        <th>
                                            Position
                                        </th>
                                        <th>
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>

                                {pendingAttendees.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="empty-table"
                                        >
                                            <div className="report-empty-state">

                                                <UserX size={32} />

                                                <strong>
                                                    No pending attendees
                                                </strong>

                                                <span>
                                                    All attendees have checked in.
                                                </span>

                                            </div>
                                        </td>
                                    </tr>

                                ) : (

                                    pendingAttendees.map(
                                        (attendee) => (

                                            <tr key={attendee.id}>

                                                <td>
                                                    {attendee.firstName}{" "}
                                                    {attendee.lastName}
                                                </td>

                                                <td>
                                                    {attendee.company || "-"}
                                                </td>

                                                <td>
                                                    {attendee.position || "-"}
                                                </td>

                                                <td>
                                                    <span className="pending-status">
                                                        {attendee.status || "PENDING"}
                                                    </span>
                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>
                            </table>
                        </div>
                    </div>
                    {/* =========================================================
                            TABLE ASSIGNMENTS
                        ========================================================= */}
                        <div className="report-section">
                            <div className="report-section-header">
                                <div className="report-section-title">
                                    <div className="report-section-icon table">
                                        <Armchair size={20} />
                                    </div>
                                    <div>
                                        <h2>
                                            Table Assignments
                                        </h2>
                                        <p>
                                            Overview of attendees assigned to each table.
                                        </p>
                                    </div>
                                </div>
                                <span className="report-section-count table">
                                    {tableAssignments.length} Tables
                                </span>
                            </div>

                            {/* TABLE */}

                            <div className="report-table-wrapper">
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                Table Number
                                            </th>
                                            <th>
                                                Attendees Seated
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {tableAssignments.length === 0 ? (

                                            <tr>
                                                <td
                                                    colSpan="2"
                                                    className="empty-table"
                                                >
                                                    <div className="report-empty-state">

                                                        <Armchair size={32} />

                                                        <strong>
                                                            No table assignments
                                                        </strong>

                                                        <span>
                                                            Table assignments will appear here.
                                                        </span>

                                                    </div>
                                                </td>
                                            </tr>

                                        ) : (

                                            tableAssignments.map((table) => (

                                                <tr key={table.tableNumber}>

                                                    <td>
                                                        {table.tableNumber === "Unassigned"
                                                            ? "Unassigned"
                                                            : `Table ${table.tableNumber}`}
                                                    </td>

                                                    <td>
                                                        {table.attendeeCount}
                                                    </td>

                                                </tr>

                                            ))

                                        )}

                                    </tbody>
                                </table>
                            </div>
                        </div>

    </div>
  )
    
}