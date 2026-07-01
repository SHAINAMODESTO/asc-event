import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaUtensils,
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaIdBadge,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { createAttendee } from "../services/attendeeListService";
import { getEventById } from "../services/eventService";

const Register = () => {
  const { state } = useLocation();
  const { eventId } = useParams();
  const navigate = useNavigate();

  const {
    eventName = "",
    eventVenue = "",
    eventStart = "",
    eventEnd = "",
    eventInquiryContact = "Bree Muyco +639561503875 or breanna.muyco@asc.com.ph",
    eventConsentMessage = "",
    eventDescription = "",
    banner = "",
    menuOptions = [],
    showMenuInForm = true,
  } = state || {};

  const [event, setEvent] = useState({});

  const [loading, setLoading] = useState(false);

  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    preferredName: "",
    email: "",
    contactNumber: "",
    companyName: "",
    position: "",
    selectedMenu: "",
  });

  const requiredFields = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "preferredName", label: "Preferred Name on Badge" },
    { key: "email", label: "Email Address" },
    { key: "contactNumber", label: "Contact Number" },
    { key: "companyName", label: "Company / Organization" },
    { key: "position", label: "Position" },
  ];
  useEffect(() => {
    loadEvent();
  }, []);

  // const loadEvent = async () => {
  //   try {
  //     const data = await getEventById(eventId);
  //     // console.log("Data", data.data);
  //     setEvent(data);
  //     console.log("event", event);
  //   } catch {
  //     navigate("/404");
  //   }
  // };

  const loadEvent = async () => {
    try {
      const response = await getEventById(eventId);

      const eventData = response.data;

      console.log("Event Data:", eventData);

      setEvent(eventData);
    } catch (err) {
      console.error(err);
    }
  };

  const validateForm = () => {
    const errors = [];

    requiredFields.forEach(({ key, label }) => {
      const value = formData[key];

      if (!value || value.toString().trim() === "") {
        errors.push(`${label} is required.`);
      }
    });

    if (!privacyChecked) {
      errors.push("Please accept the Privacy Notice.");
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await createAttendee({
        eventId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        contactNumber: formData.contactNumber,
        preferredNameOnBadge: formData.preferredName,
        company: formData.companyName,
        position: formData.position,
      });

      navigate("/thankyou", {
        replace: true,
        state: {
          eventName,
          email: formData.email,
        },
      });
    } catch (error) {
      alert(
        Array.isArray(error.response?.data?.message)
          ? error.response.data.message.join("\n")
          : error.response?.data?.message || "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName, hasIcon = false) => {
    const base =
      "w-full rounded-xl border py-3 transition duration-200 focus:outline-none focus:ring-4";

    const padding = hasIcon ? "pl-11 pr-4" : "px-4";

    const state = fieldErrors[fieldName]
      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100"
      : "border-slate-300 bg-white hover:border-slate-400 focus:border-blue-600 focus:ring-blue-100";

    return `${base} ${padding} ${state}`;
  };

  if (!privacyAccepted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
        <div
          className="
          w-full
          max-w-5xl
          max-h-[90vh]
          overflow-y-auto
          rounded-3xl
          bg-white
          shadow-2xl
        "
        >
          {/* Header */}

          <div className="border-b border-slate-200 p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Event Registration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {event.title}
            </h1>

            <h2 className="mt-2 text-slate-900">{event.description}</h2>

            <p className="mt-3">
              Please review the event details and privacy notice before
              continuing.
            </p>
          </div>

          {/* Event Summary */}

          <div className="grid gap-5 border-b border-slate-200 p-8 md:grid-cols-3">
            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <FaMapMarkerAlt className="text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold">Venue</h3>

                <p className="mt-1 text-sm text-slate-500">{event.venue}</p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <FaCalendarAlt className="text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold">Schedule</h3>

                <p className="mt-1 text-sm text-slate-500">
                  {event.startDate} to {event.endDate}{" "}
                </p>

                {/* <p className="text-sm text-slate-500">{event.endDate}</p> */}
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <FaPhoneAlt className="text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold">Contact</h3>

                <p className="mt-1 text-sm text-slate-500">
                  {eventInquiryContact}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy */}

          <div className="p-8">
            <div className="flex gap-5 rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <div>
                <FaShieldAlt className="text-4xl text-blue-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold">Privacy Notice</h2>

                <p className="mt-3 leading-8 text-slate-600">
                  {eventConsentMessage ||
                    "Your information will only be used for registration, attendance verification, event communication, and identification badge generation."}
                </p>
              </div>
            </div>

            <label className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 p-5">
              <input
                type="checkbox"
                checked={privacyChecked}
                onChange={(e) => setPrivacyChecked(e.target.checked)}
                className="mt-1 h-5 w-5 rounded"
              />

              <span className="text-sm leading-7 text-slate-600">
                {/* I have read and understood the Privacy Notice. I voluntarily
                consent to the collection and processing of my personal
                information for this event. */}
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
                onClick={() => navigate("/")}
                className="rounded-xl border border-slate-300 px-6 py-3 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                disabled={!privacyChecked}
                onClick={() => setPrivacyAccepted(true)}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
              >
                Continue Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Hero */}
      <section className="relative h-[180px] overflow-hidden ">
        {banner ? (
          <img
            src={banner}
            alt={eventName}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700" />
        )}

        <div className="absolute inset-0 bg-slate-900/60" />

        <div className="relative mx-auto flex h-full max-w-6xl items-center px-6">
          <div className="max-w-3xl">
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm text-white backdrop-blur">
              EVENT REGISTRATION
            </span>

            <h1 className="mt-6 text-5xl font-bold text-white">
              {event.title}
            </h1>
            <p className="mt-3 text-lg leading-8 text-slate-200">
              {event.description}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-10 rounded-3xl bg-white p-10 shadow-xl"
        >
          {/* Header */}

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Registration Form
            </p>

            <h2 className="mt-2 text-3xl font-bold">Personal Information</h2>

            <p className="mt-2 text-slate-500">
              Complete all required fields below.
            </p>
          </div>

          {/* Event Summary */}

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Venue</p>

              <h3 className="mt-2 font-semibold">{event.venue}</h3>
            </div>

            <div className="rounded-2xl border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Schedule</p>

              <h3 className="mt-2 font-semibold">{event.startDate}</h3>
            </div>

            <div className="rounded-2xl border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Contact</p>

              <h3 className="mt-2 font-semibold">{eventInquiryContact}</h3>
            </div>
          </div>

          {/* FORM STARTS HERE */}
          {/* Personal Information */}

          <div className="grid gap-6 md:grid-cols-2">
            {/* First Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                First Name <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className={getInputClass("firstName", true)}
                  // className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Last Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Last Name <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className={getInputClass("lastName", true)}
                />
              </div>
            </div>

            {/* Middle Initial */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Middle Initial
              </label>

              <div className="relative">
                <FaIdBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  name="middleInitial"
                  maxLength={1}
                  value={formData.middleInitial}
                  onChange={handleChange}
                  placeholder="M"
                  className={getInputClass("middleInitial", true)}
                />
              </div>
            </div>

            {/* Preferred Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Preferred Name on Badge <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="preferredName"
                required
                value={formData.preferredName}
                onChange={handleChange}
                placeholder="Preferred Name"
                className={getInputClass("preferredName", true)}
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className={getInputClass("email", true)}
                />
              </div>
            </div>

            {/* Contact */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Contact Number <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="contactNumber"
                required
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="09XXXXXXXXX"
                className={getInputClass("contactNumber")}
              />
            </div>

            {/* Company */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Company / Organization <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className={getInputClass("companyName", true)}
                />
              </div>
            </div>

            {/* Position */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Position <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="position"
                required
                value={formData.position}
                onChange={handleChange}
                placeholder="Job Position"
                className={getInputClass("position", true)}
              />
            </div>
          </div>

          {/* Meal Selection */}

          {showMenuInForm && menuOptions.length > 0 && (
            <div>
              <h3 className="mb-5 flex items-center gap-2 text-xl font-bold">
                <FaUtensils className="text-blue-600" />
                Meal Preference
              </h3>

              <div className="grid gap-4">
                {menuOptions.map((menu) => (
                  <button
                    key={menu}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        selectedMenu: menu,
                      }))
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      formData.selectedMenu === menu
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <h4 className="font-semibold text-slate-800">{menu}</h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Select this meal option for your registration.
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Agreement */}

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                className="mt-1 h-5 w-5 rounded"
              />

              <span className="text-sm leading-7 text-slate-700">
                I certify that the information I have provided is true and
                correct. I also consent to the collection and processing of my
                personal information in accordance with the Data Privacy Act of
                2012.
              </span>
            </label>
          </div>

          {/* Buttons */}

          <div className="flex flex-col gap-4 border-t border-slate-200 pt-8 md:flex-row md:justify-end">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-xl border border-slate-300 px-8 py-3 font-medium hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-10 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Registering..." : "Register Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
