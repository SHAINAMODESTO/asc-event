import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
} from "react-icons/fa";

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
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="max-h-[90vh] overflow-y-auto">
          {/* Header */}

          <div className="border-b border-slate-200 p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Event Registration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {event.title}
            </h1>

            <p className="mt-3 leading-7 text-slate-600">{event.description}</p>

            <p className="mt-3 text-sm text-slate-500">
              Please review the event details before continuing.
            </p>
          </div>

          {/* Event Summary */}

          <div className="grid gap-6 border-b border-slate-200 p-8 md:grid-cols-3">
            <InfoCard icon={FaMapMarkerAlt} title="Venue" value={event.venue} />

            <InfoCard
              icon={FaCalendarAlt}
              title="Schedule"
              value={`${event.startDate} - ${event.endDate}`}
            />

            <InfoCard icon={FaPhoneAlt} title="Contact" value={contact} />
          </div>

          {/* Privacy */}

          <div className="p-8">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <div className="flex gap-5">
                <div className="rounded-xl bg-blue-100 p-4">
                  <FaShieldAlt className="text-2xl text-blue-600" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">Privacy Notice</h2>

                  <p className="mt-1 leading-8 text-slate-600">
                    {event.consentMessage ||
                      "Your information will only be used for registration, attendance verification, event communication, and badge generation."}
                  </p>
                </div>
              </div>
            </div>

            <label className="mt-8 flex cursor-pointer items-start gap-4 rounded-2xl border p-6">
              <input
                type="checkbox"
                checked={privacyChecked}
                onChange={(e) => setPrivacyChecked(e.target.checked)}
                className="mt-1 h-5 w-5"
              />

              <span className="text-sm leading-7 text-slate-600">
                {`By signing this Event Consent form, I willingly authorize its
                Organizers to process my personal data for the sole purpose of
                achieving the objectives of this event dubbed “${event.title}” I entrust
                that my personal data shall be given utmost care and
                confidentiality by the Event Organizers and that this shall not
                be used outside the objectives and purpose above-stated.`}
              </span>
            </label>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={onCancel}
                className="rounded-xl border border-slate-300 px-6 py-3 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                disabled={!privacyChecked}
                onClick={onContinue}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
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
  <div className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
      <Icon className="text-blue-600" />
    </div>

    <div>
      <h3 className="font-semibold">{title}</h3>

      <p className="mt-1 text-sm text-slate-500">{value}</p>
    </div>
  </div>
);

export default RegisterConsent;
