import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CreateForm from "../components/CreateForm";
import AllEventsList from "../components/AllEventsList";
import AttendeesList from "../components/AttendeesList";
import EventAttendees from "../components/EventAttendees";

import "./Sidebar.css";

const sectionItems = {
  Events: [
    "Create Event",
    "Draft Events List",
    "Published Events List",
  ],
  Attendees: ["Attendee List"],
  "User Management": [
    "Admin users",
    "Event organizers",
    "Roles & permissions",
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

  // EDIT SUPPORT
  const [editEventId, setEditEventId] = useState(null);

  // Load user
  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) setUserName(storedName);
  }, []);

  // Handle sidebar query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const item = params.get("item");

    if (item) {
      setActiveItem(item);

      if (
        ["Create Event", "Draft Events List", "Published Events List"].includes(item)
      ) {
        setSelectedSection("Events");
      }

      if (item === "Attendee List") {
        setSelectedSection("Attendees");
      }
    }
  }, [location.search]);

  // Detect attendee route
  useEffect(() => {
    if (location.pathname.includes("/attendees/")) {
      setSelectedSection("Attendees");
      setActiveItem("Event Attendees");
    }
  }, [location.pathname]);

  // Load edit ID
  useEffect(() => {
    const storedEditId = localStorage.getItem("editEventId");
    if (storedEditId) {
      setEditEventId(storedEditId);
    }
  }, [activeItem]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
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
                      onClick={() => {
                        setActiveItem(item);

                        // RESET EDIT WHEN CREATING NEW
                        if (item === "Create Event") {
                          localStorage.removeItem("editEventId");
                          setEditEventId(null);
                        }

                        navigate(`/?item=${encodeURIComponent(item)}`);
                      }}
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

      {/* ================= MAIN ================= */}
      <main className="workspace">
        {!activeItem && (
          <section className="topbar">
            <div>
              <h2>Welcome back, {userName || "Admin"}!</h2>
              <p>Here's the Event Management overview for today.</p>
            </div>
          </section>
        )}

        {/* CREATE / EDIT EVENT */}
        {activeItem === "Create Event" ? (
          <CreateForm key={editEventId || "create"} />
        ) : activeItem === "Draft Events List" ? (
          <AllEventsList />
        ) : activeItem === "Attendee List" ? (
          <AttendeesList />
        ) : activeItem === "Event Attendees" ? (
          <EventAttendees />
        ) : activeItem ? (
          <section className="dashboard-grid">
            <article className="content-card">
              <h3>{activeItem}</h3>
              <p>This view is selected from the sidebar.</p>
            </article>
          </section>
        ) : (
          <section className="dashboard-grid">
            <article className="content-card">
              <h3>Upcoming Events</h3>
              <p>6</p>
            </article>

            <article className="content-card">
              <h3>Attendees Today</h3>
              <p>342</p>
            </article>

            <article className="content-card">
              <h3>Quick Actions</h3>
              <span>Create event, Manage attendees, Export reports.</span>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}