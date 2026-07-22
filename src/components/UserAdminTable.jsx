import {
  Users,
  ShieldCheck,
  UserCog,
  UserCheck,
  Trash,
  Pen,
  Eye,
} from "lucide-react";
import "./UserAdminTable.css";
import { useState } from "react";






const users = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    email: "juan@asc.com.ph",
    contactNumber: "09123456789",
    role: "Administrator",
    status: "Active",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@asc.com.ph",
    contactNumber: "09123456789",
    role: "Event Coordinator",
    status: "Active",
  },
  {
    id: 3,
    name: "Pedro Reyes",
    email: "pedro@asc.com.ph",
    contactNumber: "09123456789",
    role: "Event Coordinator",
    status: "Inactive",
  },
];

export default function UserAdminTable() {
        const [page, setPage] = useState(1);
        const [limit] = useState(10);
        const [totalPages, setTotalPages] = useState(1);
        const [showAddUserModal, setShowAddUserModal] = useState(false);

        const [newUser, setNewUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        role: "Administrator",
        status: "Active",
        });

 
 
  return (
    <div className="user-admin-page">

            {/* Header */}

            <div className="user-header">

                <div className="header-left">

                  <div className="header-icon">
                    <Users size={32} />
                  </div>

                  <div>
                    <h1>User Management</h1>
                    <p>
                      Manage administrators and event coordinators.
                    </p>
                  </div>

                </div>

            </div>

      {/* Statistics */}

            <div className="stats-grid">

              <div className="stat-card">

                <div className="stat-icon blue">
                  <Users size={24} />
                </div>

                <div className="stat-info">
                  <span>Total Users</span>
                  <h2>24</h2>
                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon red">
                  <ShieldCheck size={24} />
                </div>

                <div className="stat-info">
                  <span>Administrators</span>
                  <h2>5</h2>
                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon orange">
                  <UserCog size={24} />
                </div>

                <div className="stat-info">
                  <span>Coordinators</span>
                  <h2>19</h2>
                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon green">
                  <UserCheck size={24} />
                </div>

                <div className="stat-info">
                  <span>Active Users</span>
                  <h2>21</h2>
                </div>

              </div>

            </div>

      {/* ================= Toolbar ================= */}

<div className="toolbar-card">

    <div className="toolbar-left">

            <input
                type="text"
                placeholder="Search user..."
                className="search-box"
            />

        <select className="toolbar-select">
            <option>All Roles</option>
            <option>Administrator</option>
            <option>Event Coordinator</option>
        </select>

        <select className="toolbar-select">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
        </select>

    </div>

    <button 
       className="add-user-btn"
       onClick={() => setShowAddUserModal(true)}>
         Add User
    </button>

    </div>

    <div className="table-card">

    <table className="admin-table">

        <thead>
            <tr>
                <th>User</th>
                <th>Role</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>

                    <tbody>
            {users.map((user) => (
                <tr key={user.id}>
                <td>
                    <div className="user-cell">
                    <div className="avatar">
                        {user.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .substring(0, 2)}
                    </div>

                    <div>
                        <h4>{user.name}</h4>
                    </div>
                    </div>
                </td>

                <td>{user.role}</td>

                <td>{user.email}</td>

                <td>{user.contactNumber}</td>

                <td>
                    <span
                    className={`status ${
                        user.status === "Active" ? "active" : "inactive"
                    }`}
                    >
                    {user.status}
                    </span>
                </td>

                <td>
                    <div className="table-actions">
                    <button className="icon-btn">
                        <Eye size={20} strokeWidth={2} />
                    </button>

                    <button className="icon-btn">
                        <Pen size={20} strokeWidth={2} />
                    </button>

                    <button className="icon-btn danger">
                        <Trash size={20} strokeWidth={2} />
                    </button>
                    </div>
                </td>
                </tr>
            ))}
            </tbody>
    </table>

    </div>
    <div className="table-footer">

        <div className="table-info">
            Showing <strong>1–10</strong> of <strong>24</strong> users
        </div>
        <div className="pagination">
            <button className="page-btn">
                Previous
            </button>
            <button className="page-number active">
                1
            </button>

            <button className="page-btn">
                Next
            </button>
        </div>
    </div>

 {/* Add User Modal */}
      {showAddUserModal && (
            <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
                      <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
                        <div className = "modal-header">
                     
                              <div className="header-left">
                                  <div className="stat-icon blue">
                                      <Users size={24}/>
                                  </div>
                                  <div className="header-text">
                                      <h2>Add New User</h2>
                                      <p>Create a New User Account.</p>
                                  </div>
                              </div>
                              <button
                                  className="close-modal-btn"
                                  onClick={() => setShowAddUserModal(false)}
                              >
                                  ✕
                              </button>
                      
                      </div>
                          
                        <div className="modal-body">
                              <div className="user-form">

                                  <div className="form-group">
                                      <label>First Name</label>
                                      <input
                                          type="text"
                                          placeholder="Enter first name"
                                      />
                                  </div>
                                  <div className="form-group">
                                      <label>Last Name</label>
                                      <input
                                          type="text"
                                          placeholder="Enter last name"
                                      />
                                  </div>
                                  <div className="form-group">
                                      <label>Email Address</label>
                                      <input
                                          type="text"
                                          placeholder="Enter email address"
                                      />
                                  </div>
                                  <div className="form-group">
                                      <label>Username</label>
                                      <input
                                          type="text"
                                          placeholder="Enter username"
                                      />
                                  </div>
                                   <div className="form-group">
                                      <label>Role</label>
                                      <select>
                                          <option>Select Role</option>
                                          <option>Administrator</option>
                                          <option>Event Coordinator</option>
                                      </select>
                                  </div>
                                  <div className="form-group">
                                      <label>Account Status</label>
                                      <select>
                                          <option>Select Status</option>
                                          <option>Active</option>
                                          <option>Inactive</option>
                                      </select>
                                  </div>
                                  <div className="form-group">
                                      <label>Password</label>
                                      <input
                                          type="password"
                                          placeholder="Enter password"
                                      />
                                  </div>
                                  <div className="form-group">
                                      <label>Confirm Password</label>
                                      <input
                                          type="password"
                                          placeholder="Confirm password"
                                      />
                                  </div>
                              </div>
                           <div className="modal-footer">
                                <button className="cancel-user-btn" onClick={() => setShowAddUserModal(false)}>
                                        Cancel
                                </button>
                                <button className="save-user-btn" onClick={() => setShowAddUserModal(false)}>
                                        Save
                                </button>
                          </div>   
                        </div>
                      </div>
              </div>


        )}



    </div>
  );
}