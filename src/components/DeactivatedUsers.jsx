import { useEffect, useState } from "react";
import { UserX, RotateCcw } from "lucide-react";

import {
  getDeactivatedUsers,
  reactivateUser,
} from "../services/userService";
import "./UserAdminTable.css";

export default function DeactivatedUsers() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDeactivatedUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await getDeactivatedUsers();

      console.log("Deactivated Users Response:", response);

      const usersData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch deactivated users:", error);

      const message = error.response?.data?.message;

      if (Array.isArray(message)) {
        alert(message.join("\n"));
      } else {
        alert(message || "Failed to load deactivated users.");
      }

      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchDeactivatedUsers();
  }, []);

  const handleReactivateUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to reactivate ${user.name || "this user"}? They will be able to log in again.`
    );

    if (!confirmed) return;

    try {
      const response = await reactivateUser(user.id);

      if (response.success) {
        alert("User reactivated successfully.");
        fetchDeactivatedUsers();
      }
    } catch (error) {
      console.error("Failed to reactivate user:", error);

      const message = error.response?.data?.message;

      if (Array.isArray(message)) {
        alert(message.join("\n"));
      } else {
        alert(message || "Failed to reactivate user.");
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.toLowerCase();

    return (
      user.name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="user-admin-page">
      <div className="user-header">
        <div className="header-left">
          <div className="header-icon">
            <UserX size={32} />
          </div>

          <div>
            <h1>Deactivated Users</h1>
            <p>Accounts that have been deactivated and can be reactivated.</p>
          </div>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="toolbar-left" style={{ gridTemplateColumns: "1fr" }}>
          <input
            type="text"
            placeholder="Search user..."
            className="search-box"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Deactivated On</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loadingUsers ? (
              <tr>
                <td colSpan="6">Loading...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6">No deactivated users found.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">
                        {user.name
                          ?.split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h4>{user.name}</h4>
                      </div>
                    </div>
                  </td>

                  <td>{user.email}</td>

                  <td>
                    {user.role === "ADMIN" ? "Administrator" : "Coordinator"}
                  </td>

                  <td>
                    <span className="status inactive">Deactivated</span>
                  </td>

                  <td>
                    {user.deletedAt
                      ? new Date(user.deletedAt).toLocaleString()
                      : "Unknown"}
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-btn"
                        type="button"
                        title="Reactivate user"
                        onClick={() => handleReactivateUser(user)}
                      >
                        <RotateCcw size={20} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
