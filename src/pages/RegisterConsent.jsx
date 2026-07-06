import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
} from "react-icons/fa";
import CompanyLogo from "../assets/asc-monogram.svg";

const RegisterConsent = ({
  event,
  contact,
  privacyChecked,
  setPrivacyChecked,
  onContinue,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="max-h-[90vh] overflow-y-auto">
          {/* Header */}

          <div className="border-b border-slate-200 px-8 py-6">
            <div className="flex flex-col items-center text-center">
              <img
                src={CompanyLogo}
                alt="Company Logo"
                className="mb-4 h-16 w-auto object-contain"
              />

              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                Event Registration
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {event.title}
              </h1>

              <p className="mt-3 max-w-3xl text-slate-600">
                {event.description}
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Please review the event details before continuing.
              </p>
            </div>
          </div>

          {/* Event Information */}

          <div className="grid gap-6 border-b border-slate-200 p-8 md:grid-cols-2">
            <InfoCard icon={FaMapMarkerAlt} title="Venue" value={event.venue} />

            <InfoCard
              icon={FaCalendarAlt}
              title="Schedule"
              value={`${event.startDate} - ${event.endDate}`}
            />

            {/* <InfoCard icon={FaPhoneAlt} title="Contact" value={contact} /> */}
          </div>

          {/* Privacy */}

          <div className="space-y-8 p-8">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                  <FaShieldAlt className="text-2xl text-blue-600" />
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Privacy Notice
                  </h2>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {event.consentMessage ||
                      "Your information will only be used for registration, attendance verification, event communication, and badge generation."}
                  </p>
                </div>
              </div>
            </div>

            {/* Consent */}

            <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-300 bg-slate-50 p-6 transition hover:border-blue-300">
              <input
                type="checkbox"
                checked={privacyChecked}
                onChange={(e) => setPrivacyChecked(e.target.checked)}
                className="mt-1 h-5 w-5 rounded accent-blue-600"
              />

              <span className="text-sm leading-8 text-slate-700">
                By signing this Event Consent Form, I willingly authorize the
                organizers to process my personal data solely for the purpose of
                conducting the event <strong>"{event.title}"</strong>. I
                understand that my information will be treated with utmost
                confidentiality and will only be used for registration,
                attendance verification, event communication, and other
                activities directly related to this event. My personal data
                shall not be used for purposes outside those stated above.
              </span>
            </label>

            {/* Footer */}

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
              <button
                onClick={onCancel}
                className="rounded-xl border border-slate-300 px-7 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                disabled={!privacyChecked}
                onClick={onContinue}
                className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Continue Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, title, value }) => (
  <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:shadow-sm">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
      <Icon className="text-blue-600" />
    </div>

    <div className="min-w-0">
      <h3 className="font-semibold text-slate-900">{title}</h3>

      <p className="mt-1 break-words text-sm leading-6 text-slate-500">
        {value}
      </p>
    </div>
  </div>
);

export default RegisterConsent;
