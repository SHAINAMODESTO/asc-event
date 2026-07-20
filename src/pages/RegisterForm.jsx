// import SectionHeader from "../components/register/SectionHeader ";
// import EventSummary from "../components/register/EventSummary";
// import InputField from "../components/register/InputField";
// import PrivacyAgreement from "../components/register/PrivacyAgreement";
// import {
//   FaUser,
//   FaEnvelope,
//   FaBuilding,
//   FaIdBadge,
//   FaCalendarAlt,
// } from "react-icons/fa";
// import ContactSection from "../components/register/ContactSection";
// import { useState, useEffect } from "react";
// import { getContacts } from "../services/contactListService";
// import { createAttendeeWithCompanions } from "../services/attendeeListService";
// import {
//   formatEventDate,
//   formattedDateTime,
//   formatTime,
// } from "../helper/date.helper";
// import InfoCardMultiText from "../components/register/InfoCardMultiText";

// const formFields = [
//   {
//     name: "firstName",
//     label: "First Name",
//     placeholder: "Enter first name",
//     icon: FaUser,
//     required: true,
//   },
//   {
//     name: "lastName",
//     label: "Last Name",
//     placeholder: "Enter last name",
//     icon: FaUser,
//     required: true,
//   },
//   {
//     name: "middleInitial",
//     label: "Middle Initial",
//     placeholder: "M",
//     icon: FaIdBadge,
//     maxLength: 1,
//   },
//   {
//     name: "preferredName",
//     label: "Preferred Name on Badge",
//     placeholder: "Preferred Name",
//     required: true,
//   },
//   {
//     name: "email",
//     label: "Email Address",
//     placeholder: "example@email.com",
//     type: "email",
//     icon: FaEnvelope,
//     required: true,
//   },
//   {
//     name: "contactNumber",
//     label: "Contact Number",
//     placeholder: "09XXXXXXXXX",
//     required: true,
//   },
//   {
//     name: "companyName",
//     label: "Company / Organization",
//     placeholder: "Company Name",
//     icon: FaBuilding,
//     required: true,
//   },
//   {
//     name: "position",
//     label: "Position",
//     placeholder: "Job Position",
//     required: true,
//   },
//   {
//     name: "mealPreference",
//     label: "Meal Preference",
//     type: "select",
//     placeholder: "Select Meal Preference",
//     required: true,
//   },
// ];
// const RegisterForm = ({
//   event,
//   formData,
//   fieldErrors,
//   loading,
//   handleChange,
//   handleSubmit,
//   setFormData,

//   attendeeType,
//   setAttendeeType,

//   companions,
//   setCompanions,

//   isAdminRegistration,
// }) => {
//   console.log("isAdminRegistration:", isAdminRegistration);
//   const [contacts, setContacts] = useState([]);

//   useEffect(() => {
//     fetchContacts();
//   }, []);

//   async function fetchContacts() {
//     try {
//       const data = await getContacts();
//       setContacts(data);
//     } catch (error) {
//       console.error("Failed to fetch contacts:", error);
//     }
//   }
//   //FOR VIP
//   const addCompanion = () => {
//     if (companions.length >= 5) return;

//     setCompanions([
//       ...companions,
//       {
//         fullName: "",
//         relationship: "",
//       },
//     ]);
//   };

//   const removeCompanion = (index) => {
//     setCompanions(companions.filter((_, i) => i !== index));
//   };

//   const updateCompanion = (index, field, value) => {
//     const updated = [...companions];

//     updated[index][field] = value;

//     setCompanions(updated);
//   };
//   return (
//     <div className="mx-auto max-w-6xl px-6 py-12">
//       <form
//         onSubmit={(e) => handleSubmit(e, event.title)}
//         className="space-y-10 rounded-3xl bg-white p-10 shadow-xl"
//       >
//         <SectionHeader
//           eyebrow="Registration Form"
//           title="Personal Information"
//           description="Complete all required fields below."
//         />
//         {isAdminRegistration && (
//           <div className="mb-6">
//             <label className="mb-3 block text-sm font-semibold text-slate-700">
//               Attendee Type
//             </label>

//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               {/* Regular */}
//               <label
//                 className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
//                   attendeeType === "REGULAR"
//                     ? "border-red-600 bg-red-50 shadow-md"
//                     : "border-slate-200 bg-white hover:border-red-300 hover:bg-slate-50"
//                 }`}
//               >
//                 <input
//                   type="radio"
//                   name="attendeeType"
//                   value="REGULAR"
//                   checked={attendeeType === "REGULAR"}
//                   onChange={() => {
//                     setAttendeeType("REGULAR");
//                     setCompanions([]);
//                   }}
//                   className="hidden"
//                 />

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-base font-semibold text-slate-800">
//                       Regular
//                     </h3>

//                     <p className="mt-1 text-sm text-slate-500">
//                       Register without companions.
//                     </p>
//                   </div>

//                   <div
//                     className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
//                       attendeeType === "REGULAR"
//                         ? "border-red-600 bg-red-600"
//                         : "border-slate-300"
//                     }`}
//                   >
//                     {attendeeType === "REGULAR" && (
//                       <div className="h-2.5 w-2.5 rounded-full bg-white" />
//                     )}
//                   </div>
//                 </div>
//               </label>

//               {/* VIP */}
//               <label
//                 className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
//                   attendeeType === "VIP"
//                     ? "border-red-600 bg-red-50 shadow-md"
//                     : "border-slate-200 bg-white hover:border-red-300 hover:bg-slate-50"
//                 }`}
//               >
//                 <input
//                   type="radio"
//                   name="attendeeType"
//                   value="VIP"
//                   checked={attendeeType === "VIP"}
//                   onChange={() => setAttendeeType("VIP")}
//                   className="hidden"
//                 />

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-base font-semibold text-slate-800">
//                       VIP
//                     </h3>

//                     <p className="mt-1 text-sm text-slate-500">
//                       Register with up to 5 companions.
//                     </p>
//                   </div>

//                   <div
//                     className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
//                       attendeeType === "VIP"
//                         ? "border-red-600 bg-red-600"
//                         : "border-slate-300"
//                     }`}
//                   >
//                     {attendeeType === "VIP" && (
//                       <div className="h-2.5 w-2.5 rounded-full bg-white" />
//                     )}
//                   </div>
//                 </div>
//               </label>
//             </div>
//           </div>
//         )}
//         <ContactSection contacts={contacts.data} />

//         <div className="grid gap-6 md:grid-cols-2">
//           {formFields
//             .filter((field) => {
//               if (
//                 field.name === "mealPreference" &&
//                 !event?.requiresMealPreference
//               ) {
//                 return false;
//               }
//               return true;
//             })
//             .map((field) => (
//               <InputField
//                 key={field.name}
//                 {...field}
//                 options={
//                   field.name === "mealPreference"
//                     ? (event?.mealPreferences ?? [])
//                     : field.options
//                 }
//                 value={formData[field.name] || ""}
//                 onChange={handleChange}
//                 error={fieldErrors[field.name]}
//               />
//             ))}

//           {isAdminRegistration && attendeeType === "VIP" && (
//             <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-6">
//               {/* Header */}
//               <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                   <h3 className="text-lg font-semibold text-slate-800">
//                     Companion Information
//                   </h3>

//                   <p className="mt-1 text-sm text-slate-500">
//                     You may add up to 5 companions.
//                   </p>
//                 </div>

//                 {companions.length < 5 && (
//                   <button
//                     type="button"
//                     onClick={addCompanion}
//                     className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
//                   >
//                     + Add Companion
//                   </button>
//                 )}
//               </div>
//               {/* Companion Area */}
//               <div className="space-y-4">
//                 {companions.map((companion, index) => (
//                   <div
//                     key={index}
//                     className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-[2fr_1fr_auto]"
//                   >
//                     <div>
//                       <label className="mb-2 block text-sm font-medium text-slate-700">
//                         Full Name
//                       </label>

//                       <input
//                         type="text"
//                         placeholder="Enter full name"
//                         value={companion.fullName}
//                         onChange={(e) =>
//                           updateCompanion(index, "fullName", e.target.value)
//                         }
//                         className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
//                       />
//                     </div>

//                     <div>
//                       <label className="mb-2 block text-sm font-medium text-slate-700">
//                         Relationship/Position
//                       </label>

//                       <input
//                         type="text"
//                         placeholder="Relationship/Position"
//                         value={companion.relationship}
//                         onChange={(e) =>
//                           updateCompanion(index, "relationship", e.target.value)
//                         }
//                         className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
//                       />
//                     </div>
//                     <div>
//                       <label className="mb-2 block text-sm font-medium text-slate-700">
//                         Preferred Name on Badge
//                       </label>

//                       <input
//                         type="text"
//                         placeholder="Preferred Name"
//                         value={companion.preferredNameOnBadge}
//                         onChange={(e) =>
//                           updateCompanion(index, "", e.target.value)
//                         }
//                         className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
//                       />
//                     </div>
//                     <select
//                       value={companion.mealPreference || ""}
//                       onChange={(e) =>
//                         updateCompanion(index, "mealPreference", e.target.value)
//                       }
//                       className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
//                     >
//                       <option value="">Select Meal Preference</option>

//                       {(event?.mealPreferences ?? []).map((meal, idx) => (
//                         <option key={idx} value={meal}>
//                           {meal}
//                         </option>
//                       ))}
//                     </select>

//                     <div className="flex items-end">
//                       <button
//                         type="button"
//                         onClick={() => removeCompanion(index)}
//                         className="w-full rounded-xl bg-red-500 px-4 py-3 font-medium text-white transition hover:bg-red-600 md:w-auto"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* PrivacyAgreement */}
//         <PrivacyAgreement
//           checked={formData.privacyAgreement || false}
//           onChange={(e) =>
//             setFormData({ ...formData, privacyAgreement: e.target.checked })
//           }
//         />

//         {/* Submit Buttons */}
//         <div className="flex flex-col gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:justify-end">
//           <button
//             type="button"
//             onClick={() => window.history.back()}
//             className="rounded-xl border border-slate-300 px-8 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
//           >
//             Cancel
//           </button>

//           <button
//             type="submit"
//             disabled={loading}
//             className="rounded-xl bg-red-600 px-8 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
//           >
//             {loading ? (
//               <div className="flex items-center justify-center gap-2">
//                 <svg
//                   className="h-5 w-5 animate-spin"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />

//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                   />
//                 </svg>
//                 Registering...
//               </div>
//             ) : (
//               "Register Now"
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default RegisterForm;

import SectionHeader from "../components/register/SectionHeader ";
import EventSummary from "../components/register/EventSummary";
import InputField from "../components/register/InputField";
import PrivacyAgreement from "../components/register/PrivacyAgreement";
import {
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaIdBadge,
  FaCalendarAlt,
} from "react-icons/fa";
import ContactSection from "../components/register/ContactSection";
import { useState, useEffect } from "react";
import { getContacts } from "../services/contactListService";
import { createAttendeeWithCompanions } from "../services/attendeeListService";
import {
  formatEventDate,
  formattedDateTime,
  formatTime,
} from "../helper/date.helper";
import InfoCardMultiText from "../components/register/InfoCardMultiText";

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
  {
    name: "mealPreference",
    label: "Meal Preference",
    type: "select",
    placeholder: "Select Meal Preference",
    required: true,
  },
];
const RegisterForm = ({
  event,
  formData,
  fieldErrors,
  loading,
  handleChange,
  handleSubmit,
  setFormData,

  attendeeType,
  setAttendeeType,

  companions,
  setCompanions,

  isAdminRegistration,
}) => {
  console.log("isAdminRegistration:", isAdminRegistration);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    }
  }
  //FOR VIP
  const addCompanion = () => {
    if (companions.length >= 5) return;

    setCompanions([
      ...companions,
      {
        fullName: "",
        relationship: "",
      },
    ]);
  };

  const removeCompanion = (index) => {
    setCompanions(companions.filter((_, i) => i !== index));
  };

  const updateCompanion = (index, field, value) => {
    const updated = [...companions];

    updated[index][field] = value;

    setCompanions(updated);
  };
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
        {isAdminRegistration && (
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Attendee Type
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Regular */}
              <label
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
                  attendeeType === "REGULAR"
                    ? "border-red-600 bg-red-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-red-300 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="attendeeType"
                  value="REGULAR"
                  checked={attendeeType === "REGULAR"}
                  onChange={() => {
                    setAttendeeType("REGULAR");
                    setCompanions([]);
                  }}
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">
                      Regular
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Register without companions.
                    </p>
                  </div>

                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      attendeeType === "REGULAR"
                        ? "border-red-600 bg-red-600"
                        : "border-slate-300"
                    }`}
                  >
                    {attendeeType === "REGULAR" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </label>

              {/* VIP */}
              <label
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
                  attendeeType === "VIP"
                    ? "border-red-600 bg-red-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-red-300 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="attendeeType"
                  value="VIP"
                  checked={attendeeType === "VIP"}
                  onChange={() => setAttendeeType("VIP")}
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">
                      VIP
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Register with up to 5 companions.
                    </p>
                  </div>

                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      attendeeType === "VIP"
                        ? "border-red-600 bg-red-600"
                        : "border-slate-300"
                    }`}
                  >
                    {attendeeType === "VIP" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}
        <ContactSection contacts={contacts.data} />

        <div className="grid gap-6 md:grid-cols-2">
          {formFields
            .filter((field) => {
              if (
                field.name === "mealPreference" &&
                !event?.requiresMealPreference
              ) {
                return false;
              }
              return true;
            })
            .map((field) => (
              <InputField
                key={field.name}
                {...field}
                options={
                  field.name === "mealPreference"
                    ? (event?.mealPreferences ?? [])
                    : field.options
                }
                value={formData[field.name] || ""}
                onChange={handleChange}
                error={fieldErrors[field.name]}
              />
            ))}

          {isAdminRegistration && attendeeType === "VIP" && (
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              {/* Header */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Companion Information
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    You may add up to 5 companions.
                  </p>
                </div>

                {companions.length < 5 && (
                  <button
                    type="button"
                    onClick={addCompanion}
                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    + Add Companion
                  </button>
                )}
              </div>
              {/* Companion Area */}
              <div className="space-y-4">
                {companions.map((companion, index) => (
                  <div
                    key={index}
                    className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-[2fr_1fr_auto]"
                  >
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        First Name
                      </label>

                      <input
                        type="text"
                        placeholder="Enter First Name"
                        value={companion.firstName}
                        onChange={(e) =>
                          updateCompanion(index, "firstName", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Last Name
                      </label>

                      <input
                        type="text"
                        placeholder="Enter Last Name"
                        value={companion.lastName}
                        onChange={(e) =>
                          updateCompanion(index, "lastName", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Relationship/Position
                      </label>

                      <input
                        type="text"
                        placeholder="Relationship/Position"
                        value={companion.relationship}
                        onChange={(e) =>
                          updateCompanion(index, "relationship", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Preferred Name on Badge
                      </label>

                      <input
                        type="text"
                        placeholder="Preferred Name"
                        value={companion.preferredNameOnBadge}
                        onChange={(e) =>
                          updateCompanion(index, "", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Meal Preference
                      </label>
                      <select
                        value={companion.mealPreference || ""}
                        onChange={(e) =>
                          updateCompanion(
                            index,
                            "mealPreference",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                      >
                        <option value="">Select Meal Preference</option>

                        {(event?.mealPreferences ?? []).map((meal, idx) => (
                          <option key={idx} value={meal}>
                            {meal}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeCompanion(index)}
                        className="w-full rounded-xl bg-red-500 px-4 py-3 font-medium text-white transition hover:bg-red-600 md:w-auto"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
            className="rounded-xl bg-red-600 px-8 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
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
