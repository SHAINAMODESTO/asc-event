import { Plus, Search, Edit, Eye, Trash2 } from "lucide-react";
import "./EventAttendees.css";


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
 // const [page, setPage] = useState(1);

export default function UserAdminTable() {
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
        <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
            <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
                type="text"
                placeholder="Search user..."
                className="w-[500px] border border-gray-300 rounded-lg pl-10 pr-3 py-2"
            />
            </div>

            {/* Role Filter */}
            <select className="w-[300px] border border-gray-300 rounded-lg px-3 py-2">
            <option>All Roles</option>
            <option>Administrator</option>
            <option>Event Coordinator</option>
            </select>

            {/* Add User Button */}
            <button className="w-[200px] bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
            Add User
            </button>
        </div>
    </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="attendees-table max-h-[600px] overflow-auto">
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
         {/* Pagination 
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
            </div>*/}
      </div>
    </div>
  );
}