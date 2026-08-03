import React, { useState } from "react";
import "./QRScanner.css";
import { 
    HiCalendarDays, 
    HiMapPin, 
    HiUserGroup,
    HiInformationCircle,
    HiCheckCircle,
    HiClock
} from "react-icons/hi2";

const EventQRScanner = ({ event }) => {
    const [qrCode, setQrCode] = useState("");
    const [scanResult, setScanResult] = useState(null);
  
    //for testing only, remove this later
    const processScan = () => {
    // temporary data
    const attendee = {
        name: "Kyrie Reyes",
        code: qrCode,
        company: "ASC",
        email: "kyrie.reyes@example.com",
        position: "IT Support",
        table: 5,
        meal: "Pork",
        time: new Date().toLocaleTimeString(),
        photo: "/profile-placeholder.png"

    };
    setScanResult(attendee);
    setQrCode("");
};

 //for history dummy data
 const [history, setHistory] = useState([
    {
        id: 1,
        time: "9:41 AM",
        name: "Kyrie Reyes",
        company: "ASC",
        email: "kyrie.reyes@example.com",
        table: 5,
        meal: "Pork",
        status: "Success",
        checkInTime: "9:41 AM"
    },
    {
        id: 2,
        time: "9:39 AM",
        name: "John Doe",
        company: "OpenAI",
        email: "kyrie.reyes@example.com",
        table: 2,
        meal: "Beef",
        status: "Success",
        checkInTime: "9:39 AM"
    },
    {
        id: 3,
        time: "9:37 AM",
        name: "Anna Santos",
        company: "PLDT",
        email: "kyrie.reyes@example.com",
        table: 8,
        meal: "Fish",
        status: "Duplicate",
        checkInTime: "9:37 AM"
    }
]);
    

    return (

        <div className="event-scanner-container">


            {/* EVENT HEADER */}
            <div className="scanner-event-header">

                <div>
                    <h2 className="event-title">
                        <HiCalendarDays />
                        {event?.name || "Summer Event 2026"}
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

            {/* MAIN DASHBOARD */}

            <div className="scanner-dashboard">

                {/* LEFT COLUMN */}
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

                    {/*for UI testing only, remove this later*/}
                    <input
                    value={qrCode}
                    onChange={(e)=>setQrCode(e.target.value)}
                    onKeyDown={(e)=>{
                        if(e.key === "Enter"){
                            processScan();
                        }
                    }}
                    className="hidden-scanner-input"
                    autoFocus
                />

                </div>

                {/* RIGHT COLUMN */}
                <div className="attendee-panel">
                     

                    <h2 className="panel-title">
                        <HiInformationCircle />
                        Attendee Information
                    </h2>

                    {
                            scanResult ? (
                            <div>
                                <div className="checkin-success-banner">

                                    <HiCheckCircle className="success-icon" />

                                    <div>
                                        <h3>Checked In Successfully</h3>
                                        <p>The attendee has been successfully checked in.</p>
                                    </div>

                                </div>
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


                            </div>


                            ) : (

                            <div className="empty-state">

                            Waiting for scan...

                            </div>

                            )
                            }

                </div>

            </div>

{/* HISTORY */}
            <div className="history-panel">
                 <div className="history-header">
                    <h2 className="panel-title">
                        <HiClock />
                        Check-in History
                    </h2>
                    <span>Last {history.length} Scans</span>

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

                        {
                            history.map(item => (

                                <tr key={item.id}>
                                    <td>{item.time}</td>
                                    <td>{item.name}</td>
                                    <td>{item.company}</td>
                                    <td>{item.email}</td>
                                    <td>{item.table}</td>
                                    <td>{item.meal}</td>
                                    <td>
                                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                 </tr>
                            ))
                        }
                 </tbody>
            </table>
        </div>
        </div>

    );

};


export default EventQRScanner;