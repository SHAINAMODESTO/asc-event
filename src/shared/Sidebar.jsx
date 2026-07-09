import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { getEvents } from "../services/eventService";
import { getAttendees } from "../services/attendeeListService";
import "./Sidebar.css";

const sectionItems = {
  Events: [
    "Create Event",
    "Draft Events List",
    "Published Events List",
  ],
  "User Management": [
    "Admin users"
  ],
  Settings: [
    "Profile settings",
    "Event settings (default templates, limits)",
    "System configuration",
  ],
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userName, setUserName] = useState("");
  const [selectedSection, setSelectedSection] = useState("Events");
  const [activeItem, setActiveItem] = useState("");

  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [attendeesToday, setAttendeesToday] = useState(0);


  useEffect(() => {
  loadDashboard();
}, []);

const loadDashboard = async () => {
  try {
    const events = await getEvents();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = events.filter((event) => {
      if (!event.startDate) return false;

      const eventDate = new Date(event.startDate);
      eventDate.setHours(0, 0, 0, 0);

      return eventDate >= today;
    });

    setUpcomingEvents(upcoming.length);
  } catch (error) {
    console.error(error);
  }
};

  // Load user
  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) setUserName(storedName);
  }, []);

  // Detect active route
  useEffect(() => {
    const path = location.pathname;

    if (path.includes("/create-event")) {
      setSelectedSection("Events");
      setActiveItem("Create Event");
    } else if (path.includes("/draft-events")) {
      setSelectedSection("Events");
      setActiveItem("Draft Events List");
    } else if (path.includes("/published-events")) {
      setSelectedSection("Events");
      setActiveItem("Published Events List");
    } else if (path.includes("/useradmin-table")) {
      setSelectedSection("User Management");
      setActiveItem("Admin users");
    } 
    
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const handleNavigation = (item) => {
    setActiveItem(item);

    switch (item) {
      case "Create Event":
        localStorage.removeItem("editEventId");
        navigate("/create-event");
        break;

      case "Draft Events List":
        navigate("/draft-events");
        break;

      case "Published Events List":
        navigate("/published-events");
        break;

      case "Admin users":
        navigate("/useradmin-table");
        break;

      default:
        break;
    }
    const [upcomingEvents, setUpcomingEvents] = useState(0);
const [attendeesToday, setAttendeesToday] = useState(0);
useEffect(() => {
  loadDashboard();
}, []);

const loadDashboard = async () => {
  try {
    // EVENTS
    const eventResponse = await getEvents();

    const events = eventResponse.data || eventResponse || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = events.filter((event) => {
      if (!event.startDate) return false;

      const eventDate = new Date(event.startDate);
      eventDate.setHours(0, 0, 0, 0);

      return eventDate >= today;
    });

    setUpcomingEvents(upcoming.length);

    // ATTENDEES
    const attendeeResponse = await getAttendees();

    const attendees = attendeeResponse.data || attendeeResponse || [];

    const todayAttendees = attendees.filter((attendee) => {
      if (!attendee.createdAt) return false;

      const created = new Date(attendee.createdAt);

      return (
        created.getFullYear() === today.getFullYear() &&
        created.getMonth() === today.getMonth() &&
        created.getDate() === today.getDate()
      );
    });

    setAttendeesToday(todayAttendees.length);

  } catch (error) {
    console.error(error);
  }
};
  };

  return (
    <div className="dashboard-layout">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar-panel">
        <div className="sidebar-brand">Event Management</div>

        <nav className="sidebar-nav">
          {Object.keys(sectionItems).map((section) => (
            <div key={section} className="sidebar-section">
              <button
                type="button"
                className={`sidebar-link ${
                  selectedSection === section ? "active" : ""
                }`}
                onClick={() =>
                  setSelectedSection((prev) =>
                    prev === section ? "" : section
                  )
                }
              >
                {section}
              </button>

              {selectedSection === section && (
                <div className="sidebar-submenu">
                  {sectionItems[section].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`sidebar-sublink ${
                        activeItem === item ? "active" : ""
                      }`}
                      onClick={() => handleNavigation(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-link"
            type="button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="workspace">
        {/* Default Dashboard */}
        {location.pathname === "/" ? (
          <>
            <section className="topbar">
              <div>
                <h2>Welcome back, {userName || "Admin"}!</h2>
                <p>Here's the Event Management overview for today.</p>
              </div>
            </section>

            <section className="dashboard-grid">
              <article className="content-card">
                <h3>Upcoming Events</h3>
                <p>{upcomingEvents}</p>
              </article>

              <article className="content-card">
                <h3>Attendees Today</h3>
                <p>{attendeesToday}</p>
              </article>

              <article className="content-card">
                <h3>Quick Actions</h3>
                <span>Create event, Manage attendees, Export reports.</span>
              </article>
            </section>
          </>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}