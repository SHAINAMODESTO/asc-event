import { Plus, Search, Edit, Eye, Trash2 } from "lucide-react";
import "./EventAttendees.css";
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
    <div className="event-attendees-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Users</h1>
          <p className="text-gray-500">
            Manage administrators and event coordinators.
          </p>
            </div>
         </div>

        <div className="bg-white rounded-xl shadow p-4 mb-5">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">

                {/* Search */}
                <div className="relative flex-1">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type="text"
                    placeholder="Search user..."
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2"
                />
                </div>

                {/* Role */}
                <select className="w-full lg:w-64 border border-gray-300 rounded-lg px-3 py-2">
                <option>All Roles</option>
                <option>Administrator</option>
                <option>Event Coordinator</option>
                </select>

                {/* Button */}
                <button className="w-full lg:w-auto bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700 whitespace-nowrap"
                 onClick={() => setShowAddUserModal(true)}>
                Add User
                </button>

            </div>
            </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-[900px] w-full attendees-table">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-4">Name</th>
              <th>Email</th>
              <th>Contact Number</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4 font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.contactNumber}</td>
                <td>{user.role}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td>
                  <div className="flex justify-center gap-2">
                    <button className="p-2 rounded hover:bg-gray-100">
                      <Eye size={18} />
                    </button>

                    <button className="p-2 rounded hover:bg-yellow-100 text-yellow-600">
                      <Edit size={18} />
                    </button>

                    <button className="p-2 rounded hover:bg-red-100 text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
     </div>
         {/* Pagination */}
            <div className="pagination">
                <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                >
                Previous
                </button>

                <span>
                Page {page} of {totalPages}
                </span>

                <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                >
                Next
                </button>
            </div>
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-blue-500">
                        Add New User
                        </h2>
                

                        <button
                        onClick={() => setShowAddUserModal(false)}
                        className="text-gray-500 hover:text-red-600 text-xl"
                        >
                        ✕
                        </button>
                        
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                        <label className="block text-sm font-medium mb-1">
                            First Name
                        </label>

                        <input
                            type="text"
                            className="w-full border border-red-200 rounded-lg px-3 py-2"
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium mb-1">
                            Last Name
                        </label>

                        <input
                            type="text"
                            className="w-full border border-red-200 rounded-lg px-3 py-2"
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium mb-1">
                            Email Address
                        </label>

                        <input
                            type="email"
                            className="w-full border border-red-200 rounded-lg px-3 py-2"
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium mb-1">
                            Contact Number
                        </label>

                        <input
                            type="text"
                            className="w-full border border-red-200 rounded-lg px-3 py-2"
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium mb-1">
                            Role
                        </label>

                        <select className="w-full border border-red-200 rounded-lg px-3 py-2">
                            <option>Administrator</option>
                            <option>Event Coordinator</option>
                        </select>
                        </div>

                        <div>
                        <label className="block text-sm font-medium mb-1">
                            Status
                        </label>

                        <select className="w-full border border-red-200 rounded-lg px-3 py-2">
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                        </div>

                    </div>

                    <div className="flex justify-end gap-3 mt-8">

                        <button
                        onClick={() => setShowAddUserModal(false)}
                        className="px-5 py-2 border rounded-lg hover:bg-gray-100"
                        >
                        Cancel
                        </button>

                        <button
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                        Save User
                        </button>

                    </div>

                    </div>
                </div>
                )}
     
    </div>
  );
}