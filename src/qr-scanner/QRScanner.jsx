import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./QRScanner.css";

import {
    HiCalendarDays,
    HiMapPin,
    HiInformationCircle,
    HiCheckCircle,
    HiClock
} from "react-icons/hi2";

import {
    scanAttendee,
    checkInAttendee
} from "../services/attendeeListService";

const EventQRScanner = ({ event }) => {

    const { eventId } = useParams();

  console.log("========== EVENT QR SCANNER ==========");
  console.log("event prop:", event);
  console.log("eventId from URL:", eventId);

    const [qrCode, setQrCode] = useState("");
    const [scanResult, setScanResult] = useState(null);

    // ==============================
    // CHECK-IN HISTORY
    // ==============================

    const [history, setHistory] = useState([]);

    // ==============================
    // PROCESS QR SCAN
    // ==============================

    const processScan = async () => {

        if (!qrCode.trim()) {
            return;
        }

        if (!eventId) {
            console.error("Event ID is missing from URL.");
            return;
        }

        const scannedCode = qrCode.trim();

        try {

            console.log("========== PROCESS SCAN ==========");
            console.log("Event ID:", eventId);
            console.log("QR Code:", scannedCode);

            // =====================================
            // 1. FIND ATTENDEE
            // =====================================

            const response = await scanAttendee(
                eventId,
                qrCode.trim()
            );

            console.log("Scan response:", response);

            const attendee = response?.data;

            if (!attendee) {
                throw new Error(
                    "Attendee information not found."
                );
            }

            // =====================================
            // 2. CHECK IF ALREADY CHECKED IN
            // =====================================

            if (attendee.checkInAt) {

                console.log(
                    "Attendee already checked in:",
                    attendee.checkInAt
                );

                const existingCheckInTime =
                    new Date(attendee.checkInAt).toLocaleTimeString(
                        [],
                        {
                            hour: "numeric",
                            minute: "2-digit",
                            second: "2-digit"
                        }
                    );

                const duplicateResult = {
                    id: attendee.id,
                    name: `${attendee.firstName} ${attendee.lastName}`,
                    code: attendee.attendeesCode,
                    company: attendee.company,
                    email: attendee.emailAddress,
                    position: attendee.position,
                    table: attendee.tableNumber || "Not Assigned",
                    meal: attendee.mealPreference || "Not Specified",
                    time: existingCheckInTime,
                    status: "Duplicate"
                };

                setScanResult(duplicateResult);

                // Add duplicate scan to history
                setHistory((prev) => [
                    {
                        id: Date.now(),
                        time: new Date().toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            second: "2-digit"
                        }),
                        name: duplicateResult.name,
                        company: duplicateResult.company,
                        email: duplicateResult.email,
                        table: duplicateResult.table,
                        meal: duplicateResult.meal,
                        status: "Duplicate",
                        checkInTime: existingCheckInTime
                    },
                    ...prev
                ]);

                setQrCode("");

                return;
            }

            // =====================================
            // 3. CHECK IN ATTENDEE
            // =====================================

            const checkInResponse = await checkInAttendee(
                attendee.id
            );

            console.log(
                "Check-in response:",
                checkInResponse
            );

            // =====================================
            // 4. CURRENT CHECK-IN TIME
            // =====================================

            const checkInTime =
                new Date().toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit"
                });

            // =====================================
            // 5. CREATE SUCCESS RESULT
            // =====================================

            const result = {
                id: attendee.id,
                name: `${attendee.firstName} ${attendee.lastName}`,
                code: attendee.attendeesCode,
                company: attendee.company,
                email: attendee.emailAddress,
                position: attendee.position,
                table: attendee.tableNumber || "Not Assigned",
                meal: attendee.mealPreference || "Not Specified",
                time: checkInTime,
                status: "Success"
            };

            setScanResult(result);

            // =====================================
            // 6. ADD TO HISTORY
            // =====================================

            setHistory((prev) => [
                {
                    id: Date.now(),
                    time: checkInTime,
                    name: result.name,
                    company: result.company,
                    email: result.email,
                    table: result.table,
                    meal: result.meal,
                    status: "Success",
                    checkInTime
                },
                ...prev
            ]);

            // =====================================
            // 7. CLEAR SCANNER
            // =====================================

            setQrCode("");

        } catch (error) {

            console.error(
                "Process Scan Error:",
                error.response?.data || error
            );

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Unable to process QR code.";

            // =====================================
            // ERROR RESULT
            // =====================================

            setScanResult({
                error: true,
                code: scannedCode,
                message: errorMessage
            });

            // Add failed scan to history
            setHistory((prev) => [
                {
                    id: Date.now(),
                    time: new Date().toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit"
                    }),
                    name: "Unknown Attendee",
                    company: "-",
                    email: "-",
                    table: "-",
                    meal: "-",
                    status: "Error",
                    checkInTime: "-"
                },
                ...prev
            ]);

            setQrCode("");
        }
    };

    return (

        <div className="event-scanner-container">

            {/* ==============================
                EVENT HEADER
            ============================== */}

            <div className="scanner-event-header">

                <div>

                    <h2 className="event-title">
                        <HiCalendarDays />

                        {event?.name ||
                            event?.title ||
                            "Summer Event 2026"}
                    </h2>

                    <p className="event-details">

                        <span>
                            <HiMapPin />
                            {event?.venue || "Batangas"}
                        </span>

                        <span>
                            <HiCalendarDays />
                            {event?.date || "July 30, 2026"}
                        </span>

                    </p>

                </div>

                <div className="scanner-count">

                    <span>
                        Registered

                        <strong>
                            350
                        </strong>
                    </span>

                    <span>
                        Checked In

                        <strong>
                            180
                        </strong>
                    </span>

                </div>

            </div>

            {/* ==============================
                MAIN DASHBOARD
            ============================== */}

            <div className="scanner-dashboard">

                {/* ==============================
                    LEFT - SCANNER
                ============================== */}

                <div className="scanner-panel">

                    <h1>
                        READY TO SCAN
                    </h1>

                    <div className="scanner-box">

                        <div className="scan-line"></div>

                    </div>

                    <p>
                        Scan attendee QR using scanner device
                    </p>

                    <input
                        value={qrCode}
                        onChange={(e) =>
                            setQrCode(e.target.value)
                        }
                        onKeyDown={(e) => {

                            if (e.key === "Enter") {
                                processScan();
                            }

                        }}
                        className="hidden-scanner-input"
                        autoFocus
                    />

                </div>

                {/* ==============================
                    RIGHT - ATTENDEE
                ============================== */}
                <div className="attendee-panel">
                    <h2 className="panel-title">
                        <HiInformationCircle />
                        Attendee Information
                    </h2>
                    {scanResult ? (
                        <div>
                            {/* SUCCESS */}
                            {!scanResult.error &&
                                scanResult.status === "Success" && (
                                <div className="checkin-success-banner">
                                    <HiCheckCircle
                                        className="success-icon"
                                    />
                                    <div>
                                        <h3>
                                            Checked In Successfully
                                        </h3>
                                        <p>
                                            The attendee has been successfully checked in.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* DUPLICATE */}

                            {!scanResult.error &&
                                scanResult.status === "Duplicate" && (

                                <div className="checkin-warning-banner">

                                    <div>

                                        <h3>
                                            Already Checked In
                                        </h3>

                                        <p>
                                            This attendee has already been checked in.
                                        </p>

                                    </div>

                                </div>

                            )}

                            {/* ERROR */}

                            {scanResult.error && (

                                <div className="checkin-error-banner">

                                    <div>

                                        <h3>
                                            Scan Failed
                                        </h3>

                                        <p>
                                            {scanResult.message}
                                        </p>

                                    </div>

                                </div>

                            )}

                            {/* ATTENDEE INFORMATION */}

                            {!scanResult.error && (

                                <>
                                    <div className="attendee-profile">

                                        <div className="attendee-avatar">

                                            {scanResult.name
                                                .split(" ")
                                                .map(word => word[0])
                                                .join("")
                                                .toUpperCase()
                                            }

                                        </div>

                                        <div>

                                            <strong>
                                                {scanResult.name}
                                            </strong>

                                            <p>
                                                Code: {scanResult.code}
                                            </p>

                                        </div>

                                    </div>

                                    <div className="info-card">

                                        <p>
                                            Company

                                            <strong>
                                                {scanResult.company}
                                            </strong>
                                        </p>

                                        <p>
                                            Email

                                            <strong>
                                                {scanResult.email}
                                            </strong>
                                        </p>

                                        <p>
                                            Position

                                            <strong>
                                                {scanResult.position}
                                            </strong>
                                        </p>

                                        <p>
                                            Table Number

                                            <strong>
                                                {scanResult.table}
                                            </strong>
                                        </p>

                                        <p>
                                            Check-in Time

                                            <strong>
                                                {scanResult.time}
                                            </strong>
                                        </p>

                                        <p>
                                            Meal Preference

                                            <strong>
                                                {scanResult.meal}
                                            </strong>
                                        </p>

                                    </div>

                                </>

                            )}

                        </div>

                    ) : (

                        <div className="empty-state">

                            Waiting for scan...

                        </div>

                    )}

                </div>

            </div>

            {/* ==============================
                HISTORY
            ============================== */}

            <div className="history-panel">

                <div className="history-header">

                    <h2 className="panel-title">

                        <HiClock />

                        Check-in History

                    </h2>

                    <span>
                        Last {history.length} Scans
                    </span>

                </div>

                <table className="history-table">

                    <thead>

                        <tr>
                            <th>Time</th>
                            <th>Attendee</th>
                            <th>Company</th>
                            <th>Email</th>
                            <th>Table</th>
                            <th>Meal</th>
                            <th>Status</th>
                        </tr>

                    </thead>

                    <tbody>

                        {history.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="empty-table"
                                >
                                    No scans yet.
                                </td>

                            </tr>

                        ) : (

                            history.map((item) => (

                                <tr key={item.id}>

                                    <td>
                                        {item.time}
                                    </td>

                                    <td>
                                        {item.name}
                                    </td>

                                    <td>
                                        {item.company}
                                    </td>

                                    <td>
                                        {item.email}
                                    </td>

                                    <td>
                                        {item.table}
                                    </td>

                                    <td>
                                        {item.meal}
                                    </td>

                                    <td>

                                        <span
                                            className={`status-badge ${item.status.toLowerCase()}`}
                                        >
                                            {item.status}
                                        </span>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
};

export default EventQRScanner;