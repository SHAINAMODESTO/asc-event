import SectionHeader from "../components/register/SectionHeader ";
import EventSummary from "../components/register/EventSummary";
import InputField from "../components/register/InputField";
import PrivacyAgreement from "../components/register/PrivacyAgreement";
import { FaUser, FaEnvelope, FaBuilding, FaIdBadge } from "react-icons/fa";

const formFields = [
  {
    name: "firstName",
    label: "First Name",
    placeholder: "Enter first name",
    icon: FaUser,
    required: true,
  },
  {
    name: "lastName",
    label: "Last Name",
    placeholder: "Enter last name",
    icon: FaUser,
    required: true,
  },
  {
    name: "middleInitial",
    label: "Middle Initial",
    placeholder: "M",
    icon: FaIdBadge,
    maxLength: 1,
  },
  {
    name: "preferredName",
    label: "Preferred Name on Badge",
    placeholder: "Preferred Name",
    required: true,
  },
  {
    name: "email",
    label: "Email Address",
    placeholder: "example@email.com",
    type: "email",
    icon: FaEnvelope,
    required: true,
  },
  {
    name: "contactNumber",
    label: "Contact Number",
    placeholder: "09XXXXXXXXX",
    required: true,
  },
  {
    name: "companyName",
    label: "Company / Organization",
    placeholder: "Company Name",
    icon: FaBuilding,
    required: true,
  },
  {
    name: "position",
    label: "Position",
    placeholder: "Job Position",
    required: true,
  },
];
const RegisterForm = ({
  event,
  formData,
  fieldErrors,
  loading,
  menuOptions,
  showMenuInForm,
  handleChange,
  handleSubmit,
  setFormData,
  eventInquiryContact,
}) => {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <form
        onSubmit={(e) => handleSubmit(e, event.title)}
        className="space-y-10 rounded-3xl bg-white p-10 shadow-xl"
      >
        <SectionHeader
          eyebrow="Registration Form"
          title="Personal Information"
          description="Complete all required fields below."
        />

        <EventSummary
          venue={event.venue}
          schedule={`${event.startDate} - ${event.endDate}`}
          contact={"Bree Muyco +639561503875 or breanna.muyco@asc.com.ph"}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {formFields.map((field) => (
            <InputField
              key={field.name}
              {...field}
              value={formData[field.name] || ""}
              onChange={handleChange}
              error={fieldErrors[field.name]}
            />
          ))}
        </div>

        {/* MealSelection */}

        {/* PrivacyAgreement */}
        <PrivacyAgreement
          checked={formData.privacyAgreement || false}
          onChange={(e) =>
            setFormData({ ...formData, privacyAgreement: e.target.checked })
          }
        />

        {/* Submit Buttons */}
        <div className="flex flex-col gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-xl border border-slate-300 px-8 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Registering...
              </div>
            ) : (
              "Register Now"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
