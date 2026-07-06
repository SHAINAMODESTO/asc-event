import { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaPhoneAlt,
  FaEnvelope,
  FaUserTie,
  FaQuestionCircle,
} from "react-icons/fa";

const ContactSection = ({ contacts = [] }) => {
  const [open, setOpen] = useState(false);

  if (!contacts.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50">
      {/* Header */}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left transition hover:bg-slate-100"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-red-100 p-3">
            <FaQuestionCircle className="text-red-600" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Need help with registration?
            </h3>

            <p className="text-sm text-slate-500">
              Contact our event organizers if you have any questions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-red-600">
          {open ? "Hide Contacts" : "View Contacts"}

          {open ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </button>

      {/* Body */}

      {open && (
        <div className="grid gap-4 border-t border-slate-200 p-5 md:grid-cols-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                  <FaUserTie className="text-red-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold">{contact.name}</h4>

                  <p className="text-sm text-slate-500">{contact.position}</p>

                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <FaPhoneAlt className="text-slate-400" />
                      <span>{contact.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 break-all">
                      <FaEnvelope className="text-slate-400" />
                      <span>{contact.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactSection;
