import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { getEvents } from "../services/eventService";
import { isAdmin } from "../services/authService";
import "./Sidebar.css";

const sectionItems = {
  Events: [
    "Create Event",
    "Draft Events List",
    "Published Events List",
    "Archived Events List",
  ],
  "User Management": [
    "Admin users",
    "Deactivated Users",
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

  // ========================================
  // FE-011: ROLE-BASED NAV FILTERING
  // ========================================
  // Coordinators only get the Events section (Create Event / Draft
  // Events / Published Events) plus Reports (opened per-event, not
  // from here). "User Management" and "Settings" are admin-only, so
  // those whole sections — headers included — are hidden from the
  // sidebar for coordinators, not just individual items inside them.
  // Archived Events List is admin-only too (archive/restore requires
  // the ADMIN role on the backend), so it's filtered out of Events
  // for coordinators rather than hiding the whole section.
  const visibleSectionItems = isAdmin()
    ? sectionItems
    : {
        Events: sectionItems.Events.filter(
          (item) => item !== "Archived Events List"
        ),
      };

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

    // ATTENDEES TODAY
    // NOTE: `getAttendees()` (attendeeListService.jsx) requires an
    // `{ eventId, ... }` object — it's a per-event lookup, not a
    // system-wide one, so it can't be called from this dashboard
    // (there's no event selected here). Calling it with no argument
    // was throwing "Cannot destructure property 'eventId' of
    // undefined" and crashing this page. Until there's a real
    // system-wide "attendees registered today" endpoint, this stat
    // stays at its default (0) instead of guessing at data.

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
    } else if (path.includes("/archived-events")) {
      setSelectedSection("Events");
      setActiveItem("Archived Events List");
    } else if (path.includes("/useradmin-table")) {
      setSelectedSection("User Management");
      setActiveItem("Admin users");
    } else if (path.includes("/deactivated-users")) {
      setSelectedSection("User Management");
      setActiveItem("Deactivated Users");
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

      case "Archived Events List":
        navigate("/archived-events");
        break;

      case "Admin users":
        navigate("/useradmin-table");
        break;

      case "Deactivated Users":
        navigate("/deactivated-users");
        break;

      default:
        break;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar-panel">
        <div className="sidebar-brand">Event Management</div>

        <nav className="sidebar-nav">
          {Object.keys(visibleSectionItems).map((section) => (
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
                  {visibleSectionItems[section].map((item) => (
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