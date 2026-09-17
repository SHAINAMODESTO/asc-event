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
import { useEffect, useState } from "react";
import {
  createUser,
  getUsers,
  deactivateUser,
} from "../services/userService";

export default function UserAdminTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // REAL USERS FROM DATABASE
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    role: "COORDINATOR",
    password: "",
    confirmPassword: "",
  });

  // =========================================================
  // FETCH USERS
  // =========================================================
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await getUsers();

      console.log("Users Response:", response);

      /*
       * Supports either:
       *
       * {
       *   data: [...]
       * }
       *
       * OR
       *
       * [...]
       */

      const usersData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch users:", error);

      const message = error.response?.data?.message;

      if (Array.isArray(message)) {
        alert(message.join("\n"));
      } else {
        alert(message || "Failed to load users.");
      }

      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // =========================================================
  // LOAD USERS WHEN PAGE OPENS
  // =========================================================
  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================================================
  // DEACTIVATE USER
  // =========================================================
  const handleDeactivateUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${user.name || "this user"}? They will no longer be able to log in, and can be reactivated later from the Deactivated Users page.`
    );

    if (!confirmed) return;

    try {
      const response = await deactivateUser(user.id);

      if (response.success) {
        alert("User deactivated successfully.");
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to deactivate user:", error);

      const message = error.response?.data?.message;

      if (Array.isArray(message)) {
        alert(message.join("\n"));
      } else {
        alert(message || "Failed to deactivate user.");
      }
    }
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================
  const handleInputChange = (field, value) => {
    setNewUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================================================
  // CREATE USER
  // =========================================================
  const handleSaveUser = async () => {
    // FULL NAME
    if (!newUser.fullName.trim()) {
      alert("Full name is required.");
      return;
    }

    // EMAIL
    if (!newUser.email.trim()) {
      alert("Email address is required.");
      return;
    }

    // FIXED EMAIL REGEX
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newUser.email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    // PASSWORD
    if (!newUser.password) {
      alert("Password is required.");
      return;
    }

    // PASSWORD LENGTH
    if (newUser.password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    // CONFIRM PASSWORD
    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const userData = {
        name: newUser.fullName.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        role: newUser.role || "COORDINATOR",
      };

      console.log("Creating User:", userData);

      const response = await createUser(userData);

      console.log("Create User Response:", response);

      /*
       * Backend currently returns:
       *
       * {
       *   message: "User created successfully.",
       *   data: {
       *      id,
       *      name,
       *      email,
       *      role
       *   }
       * }
       */

      if (response?.data) {
        alert("User created successfully!");

        // Close modal
        setShowAddUserModal(false);

        // Reset form
        setNewUser({
          fullName: "",
          email: "",
          role: "COORDINATOR",
          password: "",
          confirmPassword: "",
        });

        // Go back to first page
        setPage(1);

        // IMPORTANT:
        // Reload users from the actual database
        await fetchUsers();
      } else {
        alert(
          response?.message || "User creation failed."
        );
      }
    } catch (error) {
      console.error("Failed to create user:", error);

      const message = error.response?.data?.message;

      if (Array.isArray(message)) {
        alert(message.join("\n"));
      } else {
        alert(
          message || "Failed to create user."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FILTER USERS
  // =========================================================
  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      user.name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword);

    const matchesRole =
      !roleFilter ||
      user.role?.toUpperCase() ===
        roleFilter.toUpperCase();

    /*
     * GET /users already excludes deactivated accounts (soft-deleted
     * users are only returned by GET /users/deactivated), so every
     * row loaded here is Active. "Inactive" intentionally matches
     * nothing on this page — see the Deactivated Users page instead.
     */
    const matchesStatus =
      !statusFilter ||
      statusFilter === "Active";

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus
    );
  });

  // =========================================================
  // USER STATISTICS
  // =========================================================
  const totalUsers = users.length;

  const administrators = users.filter(
    (user) =>
      user.role?.toUpperCase() === "ADMIN"
  ).length;

  const coordinators = users.filter(
    (user) =>
      user.role?.toUpperCase() ===
      "COORDINATOR"
  ).length;

  // GET /users only ever returns active (non-deactivated) accounts.
  const activeUsers = users.length;

  // =========================================================
  // PAGINATION
  // =========================================================
  const displayedUsers =
    filteredUsers.slice(
      (page - 1) * limit,
      page * limit
    );

  const calculatedTotalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length / limit
    )
  );

  // =========================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =========================================================
  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    roleFilter,
    statusFilter,
  ]);

  // =========================================================
  // RETURN
  // =========================================================

  return (
    
    <div className="user-admin-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="user-header">

        <div className="header-left">

          <div className="header-icon">
            <Users size={32} />
          </div>

          <div>
            <h1>User Management</h1>

            <p>
              Manage administrators and event
              coordinators.
            </p>
          </div>

        </div>

      </div>


      {/* ========================================
          STATISTICS
      ======================================== */}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span>
              Total Users
            </span>
            <h2>
              {totalUsers}
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon red">
            <ShieldCheck size={24} />
          </div>
          <div className="stat-info">
            <span>
              Administrators
            </span>
            <h2>
              {administrators}
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon orange">
            <UserCog size={24} />
          </div>
          <div className="stat-info">
            <span>
              Coordinators
            </span>
            <h2>
              {coordinators}
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon green">
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <span>
              Active Users
            </span>
            <h2>
              {activeUsers}
            </h2>
          </div>
        </div>
      </div>


      {/* ========================================
          TOOLBAR
      ======================================== */}

      <div className="toolbar-card">
        <div className="toolbar-left">
          <input
            type="text"
            placeholder="Search user..."
            className="search-box"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />

          <select
            className="toolbar-select"
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(
                e.target.value
              )
            }
          >
            <option value="">
              All Roles
            </option>
            <option value="ADMIN">
              Administrator
            </option>
            <option value="COORDINATOR">
              Coordinator
            </option>
          </select>
          <select
            className="toolbar-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option value="">
              All Status
            </option>
            <option value="Active">
              Active
            </option>
            <option value="Inactive">
              Inactive
            </option>
          </select>
        </div>


        <button
          className="add-user-btn"
          onClick={() =>
            setShowAddUserModal(true)
          }
        >
          Add User
        </button>
      </div>


      {/* ========================================
          TABLE
      ======================================== */}

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>


          <tbody>
            {loading ? (
              <tr>

                <td colSpan="5">
                  Loading...
                </td>
              </tr>

            ) : displayedUsers.length === 0 ? (

              <tr>

                <td colSpan="5">
                  No users found.
                </td>

              </tr>

            ) : (

              displayedUsers.map(
                (user) => (

                  <tr key={user.id}>

                    {/* NAME */}

                    <td>

                      <div className="user-cell">

                        <div className="avatar">

                          {user.name
                            ?.split(" ")
                            .map(
                              (word) =>
                                word[0]
                            )
                            .join("")
                            .substring(
                              0,
                              2
                            )
                            .toUpperCase()}

                        </div>

                        <div>

                          <h4>
                            {user.name}
                          </h4>

                        </div>

                      </div>

                    </td>


                    {/* EMAIL */}

                    <td>
                      {user.email}
                    </td>


                    {/* ROLE */}

                    <td>

                      {user.role ===
                      "ADMIN"
                        ? "Administrator"
                        : "Coordinator"}

                    </td>


                    {/* STATUS */}

                    <td>
                      <span className="status active">
                        Active
                      </span>
                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="table-actions">

                        <button
                          className="icon-btn"
                          type="button"
                        >
                          <Eye
                            size={20}
                            strokeWidth={2}
                          />
                        </button>


                        <button
                          className="icon-btn"
                          type="button"
                        >
                          <Pen
                            size={20}
                            strokeWidth={2}
                          />
                        </button>


                        <button
                          className="icon-btn danger"
                          type="button"
                          title="Deactivate user"
                          onClick={() =>
                            handleDeactivateUser(user)
                          }
                        >
                          <Trash
                            size={20}
                            strokeWidth={2}
                          />
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>


      {/* ========================================
          TABLE FOOTER
      ======================================== */}

      <div className="table-footer">

        <div className="table-info">

          Showing{" "}

          <strong>

            {displayedUsers.length > 0
              ? `${(page - 1) * limit + 1}–${
                  (page - 1) * limit +
                  displayedUsers.length
                }`
              : "0"}

          </strong>

          {" "}of{" "}

          <strong>
            {filteredUsers.length}
          </strong>

          {" "}users

        </div>


        <div className="pagination">

          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() =>
              setPage((prev) =>
                Math.max(
                  1,
                  prev - 1
                )
              )
            }
          >
            Previous
          </button>


          <button
            className="page-number active"
          >
            {page}
          </button>


          <button
            className="page-btn"
            disabled={
              page >=
              calculatedTotalPages
            }
            onClick={() =>
              setPage((prev) =>
                Math.min(
                  calculatedTotalPages,
                  prev + 1
                )
              )
            }
          >
            Next
          </button>

        </div>

      </div>


      {/* ========================================
          ADD USER MODAL
      ======================================== */}

      {showAddUserModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowAddUserModal(false)
          }
        >

          <div
            className="add-user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div className="header-left">

                <div className="stat-icon blue">

                  <Users size={24} />

                </div>

                <div className="header-text">

                  <h2>
                    Add New User
                  </h2>

                  <p>
                    Create a New User Account.
                  </p>

                </div>

              </div>


              <button
                className="close-modal-btn"
                type="button"
                onClick={() =>
                  setShowAddUserModal(false)
                }
              >
                ✕
              </button>

            </div>


            {/* MODAL BODY */}

            <div className="modal-body">

              <div className="user-form">


                {/* FULL NAME */}

                <div className="form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={
                      newUser.fullName
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "fullName",
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={
                      newUser.email
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "email",
                        e.target.value
                      )
                    }
                  />

                </div>


              


                {/* PASSWORD */}

                <div className="form-group">

                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Enter password"
                    value={
                      newUser.password
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "password",
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* CONFIRM PASSWORD */}

                <div className="form-group">

                  <label>
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={
                      newUser.confirmPassword
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "confirmPassword",
                        e.target.value
                      )
                    }
                  />

                </div>
                  {/* ROLE */}

                <div className="form-group">

                  <label>
                    Role
                  </label>

                  <select
                    value={
                      newUser.role
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "role",
                        e.target.value
                      )
                    }
                  >

                    <option value="COORDINATOR">
                      Coordinator
                    </option>

                    <option value="ADMIN">
                      Administrator
                    </option>

                  </select>

                </div>

              </div>


              {/* MODAL FOOTER */}

              <div className="modal-footer">

                <button
                  className="cancel-user-btn"
                  type="button"
                  onClick={() =>
                    setShowAddUserModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>


                <button
                  className="save-user-btn"
                  type="button"
                  onClick={
                    handleSaveUser
                  }
                  disabled={loading}
                >

                  {loading
                    ? "Saving..."
                    : "Save"}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}