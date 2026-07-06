// pages/NotFound.jsx

import { Link } from "react-router-dom";
import { FaCalendarTimes, FaHome } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-5 rounded-full">
            <FaCalendarTimes className="text-red-500 text-5xl" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800">Event Not Found</h1>

        <p className="mt-4 text-gray-600">
          The registration link is invalid, expired, or this event no longer
          exists.
        </p>

        <p className="mt-6 text-sm text-gray-400">
          If you believe this is an error, please contact the event organizer.
        </p>
      </div>
    </div>
  );
}
