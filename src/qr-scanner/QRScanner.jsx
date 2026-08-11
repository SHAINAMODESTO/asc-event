import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./QRScanner.css";

import useEvent from "../hooks/useEvent";

import {
    HiCalendarDays,
    HiMapPin,
    HiInformationCircle,
    HiCheckCircle,
    HiClock,
    HiArrowLeft,
    HiUserGroup
} from "react-icons/hi2";

import {
    scanAttendee,
    checkInAttendee,
    bulkCheckInAttendees,
    getAttendeeById
} from "../services/attendeeListService";

const EventQRScanner = () => {

    const { eventId } = useParams();
    const navigate = useNavigate();

    const inputRef = useRef(null);

    // ========================================
    // FETCH EVENT
    // ========================================

    const {
        event,
        loading: eventLoading,
        notFound
    } = useEvent(eventId);

    console.log("========== EVENT QR SCANNER ==========");
    console.log("Event ID:", eventId);
    console.log("Event:", event);

    // ========================================
    // QR CODE
    // ========================================

    const [qrCode, setQrCode] = useState("");

    // ========================================
    // ATTENDEE RESULT
    // ========================================

    const [scanResult, setScanResult] = useState(null);

    // ========================================
    // COMPANION SELECTION
    // ========================================

    const [selectedCompanions, setSelectedCompanions] = useState([]);

    // ========================================
    // BULK CHECK-IN LOADING
    // ========================================

    const [checkingIn, setCheckingIn] = useState(false);

    // ========================================
    // HISTORY
    // ========================================

    const [history, setHistory] = useState([]);

    // ========================================
    // PROCESS SCAN
    // ========================================

  // ========================================
// PROCESS SCAN
// ========================================

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
        console.log("Attendee Code:", scannedCode);

        // ========================================
        // 1. FIND ATTENDEE
        // ========================================

        const response = await scanAttendee(
            eventId,
            scannedCode
        );

        console.log("Scan response:", response);

        let attendee = response?.data;

        if (!attendee) {
            throw new Error(
                "Attendee information not found."
            );
        }

        console.log(
            "Attendee from scan:",
            attendee
        );

        // ========================================
        // 2. REFRESH ATTENDEE DATA
        // ========================================
        // This is important when the primary attendee
        // was previously scanned and companions were
        // checked in after the first scan.
        //
        // We get the latest attendee information from
        // the backend so companion status/checkInAt
        // is up-to-date.

        try {

            const latestResponse =
                await getAttendeeById(attendee.id);

            const latestAttendee =
                latestResponse?.data ||
                latestResponse;

            if (latestAttendee) {

                console.log(
                    "Latest attendee data:",
                    latestAttendee
                );

                attendee = latestAttendee;
            }

        } catch (refreshError) {

            console.warn(
                "Unable to refresh attendee details. Using scan response.",
                refreshError.response?.data ||
                refreshError
            );
        }

        // ========================================
        // 3. GET COMPANIONS
        // ========================================

        const companions =
            attendee.companions || [];

        console.log(
            "Latest companions:",
            companions
        );

        console.log(
            "Companion statuses:",
            companions.map(
                (companion) => ({
                    id: companion.id,
                    name:
                        `${companion.firstName} ${companion.lastName}`,
                    status:
                        companion.status,
                    checkInAt:
                        companion.checkInAt
                })
            )
        );

        // Clear previous selections
        setSelectedCompanions([]);

        // ========================================
        // 4. NO COMPANIONS
        // ========================================

        if (companions.length === 0) {

            // ========================================
            // ALREADY CHECKED IN
            // ========================================

            if (
                attendee.checkInAt ||
                attendee.status === "CHECKED_IN"
            ) {

                const existingCheckInTime =
                    attendee.checkInAt
                        ? new Date(
                            attendee.checkInAt
                        ).toLocaleTimeString(
                            [],
                            {
                                hour: "numeric",
                                minute: "2-digit",
                                second: "2-digit"
                            }
                        )
                        : "-";

                const duplicateResult = {
                    id: attendee.id,
                    name:
                        `${attendee.firstName} ${attendee.lastName}`,
                    code:
                        attendee.attendeesCode,
                    company:
                        attendee.company,
                    email:
                        attendee.emailAddress,
                    position:
                        attendee.position,
                    table:
                        attendee.tableNumber ||
                        "Not Assigned",
                    meal:
                        attendee.mealPreference ||
                        "Not Specified",
                    time:
                        existingCheckInTime,
                    status:
                        "Duplicate"
                };

                setScanResult(
                    duplicateResult
                );

                addHistory(
                    duplicateResult,
                    "Duplicate"
                );

                setQrCode("");

                focusScanner();

                return;
            }

            // ========================================
            // AUTOMATIC CHECK-IN
            // ========================================

            const checkInResponse =
                await checkInAttendee(
                    attendee.id
                );

            console.log(
                "Check-in response:",
                checkInResponse
            );

            const checkInTime =
                new Date().toLocaleTimeString(
                    [],
                    {
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit"
                    }
                );

            const result = {
                id:
                    attendee.id,
                name:
                    `${attendee.firstName} ${attendee.lastName}`,
                code:
                    attendee.attendeesCode,
                company:
                    attendee.company,
                email:
                    attendee.emailAddress,
                position:
                    attendee.position,
                table:
                    attendee.tableNumber ||
                    "Not Assigned",
                meal:
                    attendee.mealPreference ||
                    "Not Specified",
                time:
                    checkInTime,
                status:
                    "Success"
            };

            setScanResult(
                result
            );

            addHistory(
                result,
                "Success"
            );

            setQrCode("");

            focusScanner();

            return;
        }

        // ========================================
        // 5. DETERMINE PENDING COMPANIONS
        // ========================================
        // IMPORTANT:
        //
        // A companion is considered CHECKED_IN if
        // either:
        //
        // status === "CHECKED_IN"
        //
        // OR
        //
        // checkInAt exists.
        //
        // This prevents a companion from incorrectly
        // appearing as Pending.

    // ========================================
    // HAS COMPANIONS
    // ========================================

    const pendingCompanions =
        companions.filter(
            (companion) =>
                companion.status !== "CHECKED_IN" &&
                !companion.checkInAt
        );

    // ========================================
    // CHECK CURRENT DATABASE STATUS
    // ========================================

    const allCompanionsCheckedIn =
        companions.length > 0 &&
        pendingCompanions.length === 0;

    // ========================================
    // PRIMARY + ALL COMPANIONS ALREADY CHECKED IN
    // ========================================

    if (
        (attendee.checkInAt ||
            attendee.status === "CHECKED_IN") &&
        allCompanionsCheckedIn
    ) {

        console.log(
            "Primary attendee and ALL companions are already checked in."
        );

        const existingCheckInTime =
            attendee.checkInAt
                ? new Date(
                    attendee.checkInAt
                ).toLocaleTimeString(
                    [],
                    {
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit"
                    }
                )
                : "-";

        setScanResult({
            id: attendee.id,
            name: `${attendee.firstName} ${attendee.lastName}`,
            code: attendee.attendeesCode,
            company: attendee.company,
            email: attendee.emailAddress,
            position: attendee.position,
            table:
                attendee.tableNumber ||
                "Not Assigned",
            meal:
                attendee.mealPreference ||
                "Not Specified",
            time: existingCheckInTime,
            status: "All Checked In",
            hasCompanions: true,

            // IMPORTANT:
            // Use the fresh companions returned
            // from the API.
            companions: companions,

            pendingCompanions: []
        });

        setSelectedCompanions([]);

        addHistory(
            {
                id: attendee.id,
                name: `${attendee.firstName} ${attendee.lastName}`,
                company: attendee.company,
                email: attendee.emailAddress,
                table:
                    attendee.tableNumber ||
                    "Not Assigned",
                meal:
                    attendee.mealPreference ||
                    "Not Specified",
                time: existingCheckInTime
            },
            "Already Checked In"
        );

        setQrCode("");

        focusScanner();

        return;
    }

    // ========================================
    // PRIMARY ALREADY CHECKED IN
    // BUT SOME COMPANIONS ARE STILL PENDING
    // ========================================

    setScanResult({
        id: attendee.id,
        name: `${attendee.firstName} ${attendee.lastName}`,
        code: attendee.attendeesCode,
        company: attendee.company,
        email: attendee.emailAddress,
        position: attendee.position,
        table:
            attendee.tableNumber ||
            "Not Assigned",
        meal:
            attendee.mealPreference ||
            "Not Specified",
        time: attendee.checkInAt
            ? new Date(
                attendee.checkInAt
            ).toLocaleTimeString(
                [],
                {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit"
                }
            )
            : "-",

        status:
            attendee.status === "CHECKED_IN"
                ? "Primary Checked In"
                : "Pending",

        hasCompanions: true,

        // IMPORTANT:
        // Always replace the UI companion
        // data with the latest API data.
        companions: companions,

        pendingCompanions: pendingCompanions
    });

    setSelectedCompanions([]);

    setQrCode("");

    focusScanner();
    } catch (error) {

        console.error(
            "Process Scan Error:",
            error.response?.data ||
            error
        );

        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Unable to process QR code.";

        setScanResult({
            error:
                true,
            code:
                scannedCode,
            message:
                errorMessage
        });

        setSelectedCompanions([]);

        setHistory(
            (prev) => [
                {
                    id:
                        Date.now(),
                    time:
                        getCurrentTime(),
                    name:
                        "Unknown Attendee",
                    company:
                        "-",
                    email:
                        "-",
                    table:
                        "-",
                    meal:
                        "-",
                    status:
                        "Error",
                    checkInTime:
                        "-"
                },
                ...prev
            ]
        );

        setQrCode("");

        focusScanner();
    }
};

    // ========================================
    // CHECK IN SELECTED
    // ========================================

    const handleBulkCheckIn = async () => {

        if (!scanResult) {
            return;
        }

        const primaryId = scanResult.id;

        // Selected companions
        let attendeeIds = [
            ...selectedCompanions
        ];

        // ========================================
        // INCLUDE PRIMARY ATTENDEE
        // ========================================

        if (
            scanResult.status !== "Primary Checked In" &&
            !attendeeIds.includes(primaryId)
        ) {
            attendeeIds.unshift(primaryId);
        }

        if (attendeeIds.length === 0) {
            alert(
                "Please select at least one attendee to check in."
            );
            return;
        }

        try {

            setCheckingIn(true);

            console.log(
                "========== BULK CHECK IN =========="
            );

            console.log(
                "Attendee IDs:",
                attendeeIds
            );

            const response =
                await bulkCheckInAttendees(
                    attendeeIds
                );

            console.log(
                "Bulk check-in response:",
                response
            );

            // ========================================
            // UPDATED TIME
            // ========================================

            const checkInTime =
                getCurrentTime();

            // ========================================
            // ADD TO HISTORY
            // ========================================

            const selectedPeople = [
                {
                    id: scanResult.id,
                    name: scanResult.name,
                    company: scanResult.company,
                    email: scanResult.email,
                    table: scanResult.table,
                    meal: scanResult.meal
                },
                ...(scanResult.companions || [])
                    .filter(
                        (companion) =>
                            selectedCompanions.includes(
                                companion.id
                            )
                    )
                    .map(
                        (companion) => ({
                            id: companion.id,
                            name: `${companion.firstName} ${companion.lastName}`,
                            company:
                                companion.company ||
                                scanResult.company ||
                                "-",
                            email:
                                companion.emailAddress ||
                                "-",
                            table:
                                companion.tableNumber ||
                                scanResult.table ||
                                "-",
                            meal:
                                companion.mealPreference ||
                                scanResult.meal ||
                                "-"
                        })
                    )
            ];

            selectedPeople.forEach(
                (person) => {

                    if (
                        attendeeIds.includes(
                            person.id
                        )
                    ) {

                        setHistory(
                            (prev) => [
                                {
                                    id:
                                        Date.now() +
                                        Math.random(),
                                    time:
                                        checkInTime,
                                    name:
                                        person.name,
                                    company:
                                        person.company,
                                    email:
                                        person.email,
                                    table:
                                        person.table,
                                    meal:
                                        person.meal,
                                    status:
                                        "Success",
                                    checkInTime
                                },
                                ...prev
                            ]
                        );
                    }
                }
            );

            // ========================================
            // UPDATE UI
            // ========================================

            setScanResult(
                (prev) => ({
                    ...prev,
                    status: "Success",
                    time: checkInTime,

                    companions:
                        prev.companions?.map(
                            (companion) => {

                                if (
                                    selectedCompanions.includes(
                                        companion.id
                                    )
                                ) {

                                    return {
                                        ...companion,
                                        status:
                                            "CHECKED_IN",
                                        checkInAt:
                                            new Date().toISOString()
                                    };
                                }

                                return companion;
                            }
                        )
                })
            );

            setSelectedCompanions([]);

            alert(
                response?.message ||
                "Attendees checked in successfully."
            );

            focusScanner();

        } catch (error) {

            console.error(
                "Bulk Check-In Error:",
                error.response?.data || error
            );

            const errorMessage =
                error.response?.data?.message ||
                "Unable to check in attendees.";

            alert(errorMessage);

        } finally {

            setCheckingIn(false);
        }
    };

    // ========================================
    // SELECT ALL
    // ========================================

    const handleSelectAll = (checked) => {

        if (!scanResult?.companions) {
            return;
        }

        if (checked) {

            const available =
                scanResult.companions
                    .filter(
                        (companion) =>
                            companion.status !==
                            "CHECKED_IN" &&
                            !companion.checkInAt
                    )
                    .map(
                        (companion) =>
                            companion.id
                    );

            setSelectedCompanions(
                available
            );

        } else {

            setSelectedCompanions([]);
        }
    };

    // ========================================
    // SELECT COMPANION
    // ========================================

    const handleCompanionSelection = (
        companionId,
        checked
    ) => {

        if (checked) {

            setSelectedCompanions(
                (prev) => {

                    if (
                        prev.includes(
                            companionId
                        )
                    ) {
                        return prev;
                    }

                    return [
                        ...prev,
                        companionId
                    ];
                }
            );

        } else {

            setSelectedCompanions(
                (prev) =>
                    prev.filter(
                        (id) =>
                            id !== companionId
                    )
            );
        }
    };

    // ========================================
    // HISTORY
    // ========================================

    const addHistory = (
        result,
        status
    ) => {

        setHistory(
            (prev) => [
                {
                    id:
                        Date.now() +
                        Math.random(),
                    time:
                        getCurrentTime(),
                    name:
                        result.name,
                    company:
                        result.company,
                    email:
                        result.email,
                    table:
                        result.table,
                    meal:
                        result.meal,
                    status,
                    checkInTime:
                        result.time
                },
                ...prev
            ]
        );
    };

    // ========================================
    // CURRENT TIME
    // ========================================

    const getCurrentTime = () => {

        return new Date().toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit"
            }
        );
    };

    // ========================================
    // KEEP SCANNER FOCUSED
    // ========================================

    const focusScanner = () => {

        setTimeout(() => {

            inputRef.current?.focus();

        }, 100);
    };

    // ========================================
    // EVENT LOADING
    // ========================================

    if (eventLoading) {

        return (
            <div className="event-scanner-container">

                <div className="empty-state">
                    Loading event...
                </div>

            </div>
        );
    }

    // ========================================
    // EVENT NOT FOUND
    // ========================================

    if (notFound || !event) {

        return (
            <div className="event-scanner-container">

                <div className="empty-state">
                    Event not found.
                </div>

            </div>
        );
    }

    // ========================================
    // COMPANION DATA
    // ========================================

    const companions =
        scanResult?.companions || [];

    const availableCompanions =
        companions.filter(
            (companion) =>
                companion.status !==
                    "CHECKED_IN" &&
                !companion.checkInAt
        );

    const allSelected =
        availableCompanions.length > 0 &&
        selectedCompanions.length ===
            availableCompanions.length;

    // ========================================
    // RENDER
    // ========================================

    return (

        <div className="event-scanner-container">

            {/* ========================================
                EVENT HEADER
            ======================================== */}

            <div className="scanner-event-header">

                <div className="scanner-header-left">

                    <div>

                        <h2 className="event-title">

                            <button
                                type="button"
                                className="back-button"
                                onClick={() =>
                                    navigate(
                                        `/attendees/${eventId}`
                                    )
                                }
                            >
                                <HiArrowLeft />
                                Back
                            </button>

                            <HiCalendarDays />

                            {event.title ||
                                event.name ||
                                "Event"}

                        </h2>

                        <p className="event-details">

                            <span>

                                <HiMapPin />

                                {event.venue ||
                                    "Venue not specified"}

                            </span>

                            <span className="calendar">

                                <HiCalendarDays />

                                {event.startDate
                                    ? new Date(
                                        event.startDate
                                    ).toLocaleDateString(
                                        "en-US",
                                        {
                                            month:
                                                "long",
                                            day:
                                                "numeric",
                                            year:
                                                "numeric"
                                        }
                                    )
                                    : "Date not specified"}

                            </span>

                        </p>

                    </div>

                </div>

                <div className="scanner-count">

                    <span>
                        Registered

                        <strong>

                        </strong>

                    </span>

                    <span>
                        Checked In

                        <strong>

                        </strong>

                    </span>

                </div>

            </div>

            {/* ========================================
                DASHBOARD
            ======================================== */}

            <div className="scanner-dashboard">

                {/* ========================================
                    SCANNER
                ======================================== */}

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
                        ref={inputRef}
                        value={qrCode}
                        onChange={(e) =>
                            setQrCode(
                                e.target.value
                            )
                        }
                        onKeyDown={(e) => {

                            if (
                                e.key === "Enter"
                            ) {

                                e.preventDefault();

                                processScan();
                            }

                        }}
                        className="hidden-scanner-input"
                        autoFocus
                    />

                </div>

                {/* ========================================
                    ATTENDEE PANEL
                ======================================== */}

                <div className="attendee-panel">

                    <h2 className="panel-title">

                        <HiInformationCircle />

                        Attendee Information

                    </h2>

                    {!scanResult ? (

                        <div className="empty-state">

                            Waiting for scan...

                        </div>

                    ) : scanResult.error ? (

                        <div className="checkin-error-banner">

                            <h3>
                                Scan Failed : {scanResult.message} 
                            </h3>

                           
                        </div>

                    ) : (

                        <>

                            {/* ========================================
                                SUCCESS / STATUS
                            ======================================== */}

                            {scanResult.status ===
                                "Success" && (

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

                            {/* ========================================
                                ADDED:
                                ALL ALREADY CHECKED IN
                            ======================================== */}

                            {scanResult.status ===
                                "All Checked In" && (

                                <div className="checkin-warning-banner all-checked-in-banner">

                                    <HiCheckCircle
                                        size={44}
                                        color="#16a34a"
                                    />

                                    <div>

                                        <h3>
                                            Already Checked In
                                        </h3>

                                        <p>
                                            This attendee and all companions have already been checked in.
                                        </p>

                                    </div>

                                </div>

                            )}

                            {scanResult.status ===
                                "Duplicate" && (

                                <div className="checkin-warning-banner">

                                    <h3>
                                        Already Checked In
                                    </h3>

                                    <p>
                                        This attendee has already been checked in.
                                    </p>

                                </div>

                            )}

                            {scanResult.status ===
                                "Pending" && (

                                <div className="checkin-warning-banner">

                                    <HiUserGroup
                                        size={44}
                                        color="#d8491e"
                                    />

                                    <div>

                                        <h3>
                                            Companions Found
                                        </h3>

                                        <p>
                                            Select the attendees who are present.
                                        </p>

                                    </div>

                                </div>

                            )}

                            {scanResult.status ===
                                "Primary Checked In" && (

                                <div className="checkin-warning-banner">

                                    <HiUserGroup
                                        size={44}
                                        color="#d8491e"
                                    />

                                    <div>

                                        <h3>
                                            Companions Found
                                        </h3>

                                        <p>
                                            Select companions who are present.
                                        </p>

                                    </div>

                                </div>

                            )}

                            {/* ========================================
                                PRIMARY ATTENDEE
                            ======================================== */}

                            <div className="attendee-profile">

                                <div className="attendee-avatar">

                                    {scanResult.name
                                        .split(" ")
                                        .map(
                                            word =>
                                                word[0]
                                        )
                                        .join("")
                                        .toUpperCase()}

                                </div>

                                <div>

                                    <strong>
                                        {scanResult.name}
                                    </strong>

                                    <p>
                                        Code:{" "}
                                        {scanResult.code}
                                    </p>

                                </div>

                            </div>

                            {/* ========================================
                                PRIMARY DETAILS
                            ======================================== */}

                            <div className="info-card">

                                <p>
                                    Company

                                    <strong>
                                        {scanResult.company ||
                                            "-"}
                                    </strong>

                                </p>

                                <p>
                                    Email

                                    <strong>
                                        {scanResult.email ||
                                            "-"}
                                    </strong>

                                </p>

                                <p>
                                    Position

                                    <strong>
                                        {scanResult.position ||
                                            "-"}
                                    </strong>

                                </p>

                                <p>
                                    Table Number

                                    <strong>
                                        {scanResult.table ||
                                            "-"}
                                    </strong>

                                </p>

                                <p>
                                    Check-in Time

                                    <strong>
                                        {scanResult.time ||
                                            "-"}
                                    </strong>

                                </p>

                                <p>
                                    Meal Preference

                                    <strong>
                                        {scanResult.meal ||
                                            "-"}
                                    </strong>

                                </p>

                            </div>

                            {/* ========================================
                                COMPANIONS
                            ======================================== */}

                            {companions.length > 0 && (

                                <div className="companion-section">

                                    <div className="companion-section-header">

                                        <HiUserGroup
                                            size={44}
                                            color="#d8491e"
                                        />

                                        <div>

                                            <h1>
                                                Companions
                                            </h1>

                                            <span>
                                                {
                                                    companions.length
                                                }{" "}
                                                Total
                                            </span>

                                        </div>

                                        {/* ========================================
                                            SELECT ALL
                                            HIDE WHEN EVERYONE IS CHECKED IN
                                        ======================================== */}

                                        {availableCompanions.length > 0 && (

                                            <label className="select-all-label">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        allSelected
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleSelectAll(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                Select All Available

                                            </label>

                                        )}

                                    </div>

                                    {/* ========================================
                                        COMPANION LIST
                                    ======================================== */}

                                    <div className="companion-list">

                                        {companions.map(
                                            (
                                                companion
                                            ) => {

                                                const checkedIn =
                                                    companion.status ===
                                                        "CHECKED_IN" ||
                                                    !!companion.checkInAt;

                                                const selected =
                                                    selectedCompanions.includes(
                                                        companion.id
                                                    );

                                                return (

                                                    <div
                                                        key={
                                                            companion.id
                                                        }
                                                        className={`companion-card ${
                                                            checkedIn
                                                                ? "checked-in"
                                                                : ""
                                                        }`}
                                                    >

                                                        <div className="companion-checkbox">

                                                            <input
                                                                type="checkbox"
                                                                disabled={
                                                                    checkedIn
                                                                }
                                                                checked={
                                                                    selected
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleCompanionSelection(
                                                                        companion.id,
                                                                        e.target.checked
                                                                    )
                                                                }
                                                            />

                                                        </div>

                                                        <div className="companion-info">

                                                            <strong>

                                                                {
                                                                    companion.firstName
                                                                }{" "}

                                                                {
                                                                    companion.lastName
                                                                }

                                                            </strong>

                                                            <span>

                                                                {
                                                                    companion.position ||
                                                                    "No Position"
                                                                }

                                                            </span>

                                                            <p>

                                                                Table Number:

                                                                <strong className="companion-table-number">

                                                                    {
                                                                        companion.tableNumber ||
                                                                        "Not Assigned"
                                                                    }

                                                                </strong>

                                                            </p>

                                                            <small>

                                                                Check In Time:{" "}

                                                                {
                                                                    companion.checkInAt

                                                                        ? new Date(
                                                                            companion.checkInAt
                                                                        ).toLocaleString()

                                                                        : "-"
                                                                }

                                                            </small>

                                                        </div>

                                                        <div className="companion-status">

                                                            {checkedIn ? (

                                                                <span className="status-success">

                                                                    ✔ Already Checked In

                                                                </span>

                                                            ) : selected ? (

                                                                <span className="status-selected">

                                                                    ✓ Selected

                                                                </span>

                                                            ) : (

                                                                <span className="status-pending">

                                                                    ● Pending

                                                                </span>

                                                            )}

                                                        </div>

                                                    </div>

                                                );
                                            }
                                        )}

                                    </div>

                                    {/* ========================================
                                        CHECK IN BUTTON

                                        HIDDEN ONLY WHEN EVERYONE IS
                                        ALREADY CHECKED IN
                                    ======================================== */}

                                    {scanResult.status !==
                                        "All Checked In" && (

                                        <div className="companion-checkin-footer">

                                            <div className="selected-summary">

                                                <strong>
                                                    {
                                                        selectedCompanions.length
                                                    }
                                                </strong>

                                                <span>
                                                    Companion(s) selected
                                                </span>

                                            </div>

                                            <button
                                                type="button"
                                                className="bulk-checkin-button"
                                                disabled={
                                                    checkingIn ||
                                                    (
                                                        selectedCompanions.length ===
                                                        0 &&
                                                        scanResult.status !==
                                                            "Pending"
                                                    )
                                                }
                                                onClick={
                                                    handleBulkCheckIn
                                                }
                                            >

                                                {checkingIn
                                                    ? "Checking In..."
                                                    : "Check In Selected"}

                                            </button>

                                        </div>

                                    )}

                                </div>

                            )}

                        </>

                    )}

                </div>

            </div>

            {/* ========================================
                HISTORY
            ======================================== */}

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

                            <th>
                                Time
                            </th>

                            <th>
                                Attendee
                            </th>

                            <th>
                                Company
                            </th>

                            <th>
                                Email
                            </th>

                            <th>
                                Table
                            </th>

                            <th>
                                Meal
                            </th>

                            <th>
                                Status
                            </th>

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

                            history.map(
                                (item) => (

                                    <tr
                                        key={
                                            item.id
                                        }
                                    >

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
                                                {
                                                    item.status
                                                }
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
    );
};

export default EventQRScanner;