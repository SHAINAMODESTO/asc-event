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
import { useNavigate } from "react-router-dom";




export default function EventReports() {

const [eventDetails, setEventDetails] = useState(null);
const navigate = useNavigate();

  return (
    <div className="event-reports-page">

      {/* ================= HEADER ================= */}
            <div className="reports-header">

            <button
                className="back-button"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={18} />
                <span>Back</span>
            </button>

            <div className="reports-title">

                <div className="reports-icon">
                <FileBarChart2 size={34} />
                </div>

                <div>
                <label>Event Reports</label>
                <p>
                    View attendance reports and export event data.
                </p>
                </div>

            </div>

            </div>

      {/* ================= SUMMARY =================  */}

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon registered">
            <Users size={22} />
          </div>
          <div>
            <span>Total Registered</span>
            <h2>1,250</h2>
            <span>All Attendees</span>
          </div>
        </div>

         <div className="summary-card">

          <div className="summary-icon checked">
            <UserCheck size={22} />
          </div>

          <div>
            <span>Checked In</span>
            <h2>892</h2>
            <span>71.4% of total</span>
          </div>

        </div>

        <div className="summary-card">
          <div className="summary-icon pending">
            <UserX size={22} />
          </div>
          <div>
            <span>Pending Check-in</span>
            <h2>358</h2>
            <span>28.6% of total</span>
          </div>

        </div>
        <div className="summary-card">
          <div className="summary-icon table">
            <Armchair size={22} />
          </div>

          <div>
            <span>Tables Assigned</span>
            <h2>54</h2>
            <span>87% utilization</span>
          </div>
        </div>
      </div>
      {/* ================= EXPORT TOOLBAR ================= */}
        <div className="reports-toolbar">
            <div className="reports-toolbar-title">
                <h2>Available Reports</h2>
                <p>Select the reports you want to include in the export.</p>
            </div>
            <div className="reports-toolbar-actions">
                <button className="white-btn">
                Export CSV
                </button>
                <button className="blue-btn">
                Export PDF
                </button>
            </div>
        </div>
       
    {/* ================= REPORTS ================= */}

        {/* ================= SUCCESSFULLY CHECKED-IN TABLE ================= */}
       <div className="report-section">
            <div className="report-header">
                <label className="report-checkbox">
                    <input type="checkbox" />
                    <span>Successfully Checked-In</span>
                </label>
            </div>
            <div className="report-table-wrapper">
                <table className="report-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Company</th>
                        <th>Position</th>
                        <th>Check-in Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td colSpan="4" className="empty-table">
                        No checked-in attendees.
                        </td>
                    </tr>
                    </tbody>
                </table>
                </div>

       </div>
       {/* ================= PENDING CHECKED-IN TABLE ================= */} 
       <div className="report-section">
            <div className="report-header">
                <label className="report-checkbox">
                    <input type="checkbox" />
                    <span>Pending Checked-In</span>
                </label>
            </div>
            <div className="report-table-wrapper">
                <table className="report-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Company</th>
                        <th>Position</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td colSpan="4" className="empty-table">
                        No pending attendees.
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
       </div>

       {/* ================= TABLE ASSIGNMENTS TABLE ================= */} 
       <div className="report-section"></div>
       <div className="report-section">
            <div className="report-header">
                <label className="report-checkbox">
                    <input type="checkbox" />
                    <span>Table Assignments</span>
                </label>
            </div>
            <div className="report-table-wrapper">
                <table className="report-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Company</th>
                        <th>Position</th>
                        <th>Table Number</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td colSpan="4" className="empty-table">
                        No pending attendees.
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
       
       </div>
    </div>
  );
}