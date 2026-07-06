// import React from "react";
// import { CheckCircle } from "lucide-react";
// import "./ThankYou.css";

// const ThankYou = () => {
//   return (
//     <div className="thankyou-page">
//       <div className="thankyou-card">
//         <div className="success-icon">
//           <CheckCircle size={90} strokeWidth={1.8} />
//         </div>

//         <h1>Your registration has been successfully submitted.</h1>

//         <p>
//           Our team will contact you through your provided email regarding
//           updates about the event.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default ThankYou;

import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaEnvelope,
  FaCalendarAlt,
  FaHome,
} from "react-icons/fa";

const ThankYou = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { eventName = "Event Registration", email = "" } = state || {};

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-10 shadow-xl">
        {/* Success Icon */}

        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <FaCheckCircle className="text-6xl text-green-600" />
          </div>
        </div>

        {/* Title */}

        <div className="mt-8 text-center">
          <p className="font-semibold uppercase tracking-widest text-green-600">
            Registration Successful
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-900">
            You're Registered!
          </h1>

          <p className="mt-4 text-slate-500 leading-7">
            Thank you for registering. Your registration has been successfully
            received.
          </p>
        </div>

        {/* Event */}

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-red-600 text-xl" />

            <div>
              <h3 className="font-semibold text-slate-900">Event</h3>

              <p className="text-slate-600">{eventName}</p>
            </div>
          </div>
        </div>

        {/* Email */}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-red-600 text-xl" />

            <div>
              <h3 className="font-semibold text-slate-900">
                Confirmation Email
              </h3>

              <p className="text-slate-600">{email}</p>
            </div>
          </div>
        </div>

        {/* Reminder */}

        {/* <div className="mt-8 rounded-2xl bg-red-50 border border-red-200 p-6">
          <h3 className="font-semibold text-red-700">What's Next?</h3>

          <ul className="mt-4 space-y-3 text-slate-600">
            <li>✔ Check your email for your registration confirmation.</li>

            <li>✔ Save the event date to your calendar.</li>

            <li>✔ Bring a valid ID during the event.</li>
          </ul>
        </div> */}

        {/* Button */}

        {/* <button
          onClick={() => navigate("/", { replace: true })}
          className="
          mt-10
          flex
          w-full
          items-center
          justify-center
          gap-3
          rounded-xl
          bg-red-600
          py-4
          font-semibold
          text-white
          transition
          hover:bg-red-700
          "
        >
          <FaHome />
          Back to Home
        </button> */}
      </div>
    </div>
  );
};

export default ThankYou;
