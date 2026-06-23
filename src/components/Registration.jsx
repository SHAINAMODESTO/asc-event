import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Registration.css";

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [consentAccepted, setConsentAccepted] = useState(false);

  const {
    fields = [
      { label: "First Name", type: "text", required: true },
      { label: "Middle Initial", type: "text", required: false },
      { label: "Last Name", type: "text", required: true },
      { label: "Email Address", type: "email", required: true },
    ],
    menuOptions = ["Pork", "Fish", "Chicken"],
    showMenuInForm = true,
    eventName = "",
    eventVenue = "",
    eventStart = "",
    eventEnd = "",
    eventInquiryContact = "",
    eventConsentMessage = `By signing this Event Consent form, I willingly authorize its Organizers to process my personal data for the sole purpose of achieving the objectives of this event dubbed "${eventName}".`,
    eventFormInstructions = "Please fill out all required information",
    eventDescription = "Please fill out all required information",
  } = location.state || {};

  const navigateHome = () => navigate("/", { replace: true });

  const headerText =
    eventDescription && eventDescription !== eventFormInstructions
      ? eventDescription
      : eventFormInstructions;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white border-2 border-green-500 rounded-xl shadow-lg p-8">

        <hr className="my-6 border-green-300" />

        {/* ✅ ONLY SHOW AFTER CONSENT */}
        {consentAccepted && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {eventName + " Registration Form"}
            </h1>
            <p className="text-gray-500 mt-2">{headerText}</p>

            <div className="mt-4 text-sm text-slate-600">
              {eventVenue && <p>Venue: {eventVenue}</p>}
              {(eventStart || eventEnd) && (
                <p>
                  Date:{" "}
                  {eventStart
                    ? new Date(eventStart).toLocaleString()
                    : "TBD"}
                  {eventEnd
                    ? ` — ${new Date(eventEnd).toLocaleString()}`
                    : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ================= CONSENT MODAL ================= */}
        {!consentAccepted ? (
          <div className="consent-modal-overlay" role="dialog" aria-modal="true">
            <div className="consent-modal">

              <div className="consent-header">
                <h2>{eventName + " Registration"}</h2>
                <p className="consent-text">
                  Please review the event details and consent message before continuing.
                </p>
              </div>

             <div className="consent-grid-two">
  <div className="consent-card">
    <p className="text-sm font-semibold">Event Venue</p>
    <p className="consent-text mt-2">
      {eventVenue || "No venue set"}
    </p>
  </div>

  <div className="consent-card">
    <p className="text-sm font-semibold">Date & Time</p>
    <p className="consent-text mt-2">
      {eventStart
        ? new Date(eventStart).toLocaleString()
        : "TBD"}
      {eventEnd
        ? ` — ${new Date(eventEnd).toLocaleString()}`
        : ""}
    </p>
  </div>
</div>

              <div className="consent-card" style={{ marginTop: 12 }}>
                <p className="text-sm font-semibold">Inquiry Contact</p>
                <p className="consent-text mt-2" style={{ whiteSpace: "pre-line" }}>
                  {eventInquiryContact || "No contact info available."}
                </p>
              </div>

              <div className="consent-card" style={{ marginTop: 12 }}>
                <p className="consent-text mt-2" style={{ whiteSpace: "pre-line" }}>
                  {eventConsentMessage}
                </p>
              </div>

              <div className="consent-actions">
                <button
                  type="button"
                  className="consent-btn cancel"
                  onClick={navigateHome}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="consent-btn accept"
                  onClick={() => setConsentAccepted(true)}
                >
                  I Accept
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* ================= REGISTRATION FORM ================= */
          <form className="space-y-6">

            {fields.map((field, index) => (
              <div key={index}>
                <label className="block text-gray-700 mb-1 font-semibold">
                  {field.label}{field.required ? " *" : ""}
                </label>

                <input
                  type={field.type}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            ))}

            {/* MENU */}
            {showMenuInForm && (
              <fieldset className="border border-blue-500 rounded-lg p-4">
                <legend className="text-blue-600 font-medium px-2">
                  Menu Reference
                </legend>

                <div className="flex flex-col gap-3 mt-2">
                  {menuOptions.map((option, index) => (
                    <label key={index} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="menu"
                        value={option}
                        className="mr-2 accent-blue-500"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {/* CONSENT CHECK */}
            <div className="bg-gray-50 p-4 text-xs text-gray-700">
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <p>
                <strong>FURTHER, I HEREBY ACKNOWLEDGE</strong> that I have read and understood the Privacy Notice and agree thereto as well.
                <br />I give my consent to collect, use and process my personal information. I understand that my consent does not preclude the existence of other <br></br>lawful bases for processing personal data, and does not waive any of my rights under the Data Privacy Act of 2012 and other applicable laws.
              </p>
              </label>
            </div>

            <button type="submit" className="submit">
              Submit Registration
            </button>

            <button type="button" className="cancel" onClick={navigateHome}>
              Cancel
            </button>

          </form>
        )}
      </div>
    </div>
  );
};

export default Register;