import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
} from "react-icons/fa";
import CompanyLogo from "../assets/asc-monogram.svg";
import {
  formatEventDate,
  formattedDateTime,
  formatTime,
} from "../helper/date.helper";
import InfoCardMultiText from "../components/register/InfoCardMultiText";

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

              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-600">
                Event Registration
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {event.title}
              </h1>

              <p className="mt-3 max-w-2xl text-slate-600">
                {event.description}
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Please review the event details before continuing.
              </p>
            </div>
          </div>

          {/* Event Information */}

          <div className="grid gap-6 border-b border-slate-200 p-4 md:grid-cols-2">
            <InfoCard icon={FaMapMarkerAlt} title="Venue" value={event.venue} />

            <InfoCardMultiText
              icon={FaCalendarAlt}
              title="Schedule"
              items={[
                {
                  label: "Date",
                  value: formatEventDate(event.startDate),
                },
                {
                  label: "Registration",
                  value: formatTime(event.checkInTime),
                },
                {
                  label: "Lunch",
                  value: formatTime(event.lunchTime),
                },
              ]}
            />

            {/* <InfoCard icon={FaPhoneAlt} title="Contact" value={contact} /> */}
          </div>

          {/* Privacy */}

          <div className="space-y-8 p-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100">
                  <FaShieldAlt className="text-2xl text-red-600" />
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

            <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-300 bg-slate-50 p-6 transition hover:border-red-300">
              <input
                type="checkbox"
                checked={privacyChecked}
                onChange={(e) => setPrivacyChecked(e.target.checked)}
                className="mt-1 h-5 w-5 rounded accent-red-600"
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

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                onClick={onCancel}
                className="rounded-xl border border-slate-300 px-7 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                disabled={!privacyChecked}
                onClick={onContinue}
                className="rounded-xl bg-red-600 px-7 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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
  <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-red-200 hover:shadow-sm">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
      <Icon className="text-red-600" />
    </div>

    <div className="min-w-0">
      <h3 className="font-semibold text-slate-900">{title}</h3>

      <p className="mt-1 break-words text-sm leading-6 text-slate-500">
        {value}
      </p>
    </div>
  </div>
);

// const InfoCardMultiText = ({ icon: Icon, title, [Key,value] }) => (
//   <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-red-200 hover:shadow-sm">
//     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
//       <Icon className="text-red-600" />
//     </div>

//     <div className="min-w-0">
//       <h3 className="font-semibold text-slate-900">{title}</h3>

//       <p className="mt-1 break-words text-sm leading-6 text-slate-500">
//         {value}
//       </p>
//     </div>
//   </div>
// );

export default RegisterConsent;
