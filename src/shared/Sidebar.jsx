import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import "./Sidebar.css";

const sectionItems = {
  Events: [
    "Create Event",
    "Draft Events List",
    "Published Events List",
  ],
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
          </>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}