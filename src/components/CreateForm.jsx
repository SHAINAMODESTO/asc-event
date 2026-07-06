import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, SquarePen } from "lucide-react";
import {
  createEvent,
  publishEvent,
  getEventById,
} from "../services/eventService";
import "./CreateForm.css";

const CreateForm = () => {
  const navigate = useNavigate();

  const [formTitle] = useState("Registration Form");

  const [description, setDescription] = useState(
    `Event Date: August 27, 2025 - 9AM-5PM (Registration and Breakfast: 8:00 - 9:00 AM)

Event Venue: Rizal Ballroom, Makati Shangri-La Hotel

Inquiry Contact:
- Digna Santos +639189032173 or digna.santos@asc.com.ph
- Bree Muyco +639561503875 or breanna.muyco@asc.com.ph
- Patricia Tombo +639171248773 or patricia.tombo@asc.com.ph`
  );

  // Event Description
  const [eventDescription, setEventDescription] = useState(
    "Please fill out all required information"
  );

  //Show Accept Responses
  const [showAcceptResponses, setShowAcceptResponses] = useState(false);

  // Basic Event Info
  const [eventName, setEventName] = useState("");
  const [eventVenue, setEventVenue] = useState("");

  // NEW: Max participants
  const [maxParticipants, setMaxParticipants] = useState("");

  // Event Dates
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");

  // Registration Dates (Accept Responses)
  const [registrationStart, setRegistrationStart] = useState("");
  const [registrationEnd, setRegistrationEnd] = useState("");

  // Banner
  const [banner, setBanner] = useState("");

  // Inquiry Contacts
  const [eventInquiryContact, setEventInquiryContact] = useState(
    `- Digna Santos +639189032173 or digna.santos@asc.com.ph
- Bree Muyco +639561503875 or breanna.muyco@asc.com.ph
- Patricia Tombo +639171248773 or patricia.tombo@asc.com.ph`
  );

  // Consent Message
  const [eventConsentMessage, setEventConsentMessage] = useState(
    `By accepting this Event Consent form, I willingly authorize its Organizers to process my personal data for the sole purpose of achieving the objectives of this event.`
  );

  const fileInputRef = useRef(null);

  // Default Registration Fields
  const [fields, setFields] = useState([
    { label: "First Name", type: "text", required: true },
    { label: "Middle Initial", type: "text", required: false },
    { label: "Last Name", type: "text", required: true },
    { label: "Email Address", type: "email", required: true },
    { label: "Preferred Name for ID", type: "text", required: true },
    { label: "Mobile Number", type: "number", required: true },
    { label: "Company Name", type: "text", required: true },
    { label: "Position", type: "text", required: true },
  ]);

  // Menu Options
  const [menuOptions, setMenuOptions] = useState([
    "Pork",
    "Fish",
    "Chicken",
  ]);

  const [showMenuInForm, setShowMenuInForm] = useState(false);
  const [showLootBags, setShowLootBags] = useState(false);
  const [lootBagOptions, setLootBagOptions] = useState([""]);
  const [showBannerUpload, setShowBannerUpload] = useState(false);
const [bannerText, setBannerText] = useState("");


  const addLootBagOption = () => {
  setLootBagOptions([...lootBagOptions, ""]);
};

const updateLootBagOption = (index, value) => {
  const updated = [...lootBagOptions];
  updated[index] = value;
  setLootBagOptions(updated);
};

const removeLootBagOption = (index) => {
  const updated = lootBagOptions.filter((_, i) => i !== index);
  setLootBagOptions(updated);
};

  // Load Edit Data
  React.useEffect(() => {
    const editData = localStorage.getItem("ascEventEdit");

    if (editData) {
      try {
        const parsed = JSON.parse(editData);

        setEventDescription(parsed.eventDescription || "");
        setEventName(parsed.eventName || "");
        setEventVenue(parsed.eventVenue || "");
        setMaxParticipants(parsed.maxParticipants || "");
        setEventInquiryContact(parsed.eventInquiryContact || "");
        setEventStart(parsed.eventStart || "");
        setEventEnd(parsed.eventEnd || "");
        setRegistrationStart(parsed.registrationStart || "");
        setRegistrationEnd(parsed.registrationEnd || "");
        setEventConsentMessage(parsed.eventConsentMessage || "");
        setBanner(parsed.banner || "");
        setFields(parsed.fields || fields);
        setMenuOptions(parsed.menuOptions || menuOptions);
        setShowMenuInForm(parsed.showMenuInForm ?? true);
      } catch (error) {
        console.error("Failed to load edit template", error);
      } finally {
        localStorage.removeItem("ascEventEdit");
      }
    }
  }, []);

  const addField = () =>
    setFields([...fields, { label: "", type: "text", required: false }]);

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const removeField = (index) =>
    setFields(fields.filter((_, i) => i !== index));

  const addMenuOption = () => setMenuOptions([...menuOptions, ""]);

  const updateMenuOption = (index, value) => {
    const updated = [...menuOptions];
    updated[index] = value;
    setMenuOptions(updated);
  };

  const removeMenuOption = (index) =>
    setMenuOptions(menuOptions.filter((_, i) => i !== index));



  /*const STORAGE_KEY = "ascEventTemplates";

  const saveTemplateToStorage = (template) => {
    const existing = localStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([template, ...parsed]));
  }; */

 const handleSaveDraft = async () => {
  const eventData = {
    title: eventName,
    description: eventDescription,
    venue: eventVenue,
    startDate: eventStart ? eventStart.split("T")[0] : null,
    endDate: eventEnd ? eventEnd.split("T")[0] : null,
    requiresMealPreference: showMenuInForm,
    isRegistrationRequired: true,
    registrationStart: registrationStart
      ? registrationStart.replace("T", " ")
      : null,
    registrationEnd: registrationEnd
      ? registrationEnd.replace("T", " ")
      : null,
      
  };

  try {
    const response = await createEvent(eventData);

    if (response.success) {
      alert("Draft saved successfully!");
      navigate("/?item=Draft Events List");
    }
  } catch (error) {
    console.error(error.response?.data || error);
    alert(error.response?.data?.message || "Failed to save draft");
  }
};

  // Save Event
  const handleSaveTemplate = async () => {
  const eventData = {
    title: eventName,
    description: eventDescription,
    venue: eventVenue,
    startDate: eventStart ? eventStart.split("T")[0] : null,
    endDate: eventEnd ? eventEnd.split("T")[0] : null,
    requiresMealPreference: showMenuInForm,
    isRegistrationRequired: true,
    registrationStart: registrationStart
      ? registrationStart.replace("T", " ")
      : null,
    registrationEnd: registrationEnd
      ? registrationEnd.replace("T", " ")
      : null,
  };

  try {
    const createResponse = await createEvent(eventData);

    if (createResponse.success) {
      await publishEvent(createResponse.data.id);

      navigate("/registration", {
        state: createResponse.data,
      });

      alert("Event published successfully!");
    }
  } catch (error) {
    console.error(error.response?.data || error);
    alert(error.response?.data?.message || "Failed to publish event");
  }
};

  return (
    <div className="w-[100%] !h-[100%] w-4/5 h-screen bg-white p-6 text-[12px] overflow-y-auto">
       <div className="flex items-center justify-between  !h-[100px] mb-6  bg-border-[#c30d2e] p-4 shadow-md">
              <h1 className="text-white text-xl font-semibold tracking-wide">Create an Event Registration Form </h1>
       </div>
         <div className="w-full flex justify-center px-6 pt-2">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-[700px] overflow-y-auto bg-white rounded-lg shadow-md p-10">
      
                  {/* LEFT SIDE */}
                  <div>
                    <div className="space-y-3">
                    <h2 className="section-title">Event Name</h2>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Enter event name"
                      className="form-input"
                      required
                    />
                    </div>
                    {/* Event Description */}
                     <br></br>
                     <div className="space-y-3">
                    <h2 className="section-title">Event Description</h2>
                    <textarea
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      placeholder="Enter event description"
                      className="form-input !w-[490px] !h-[80px]"
                      rows="4"
                    />
                    </div>
                     <br></br>
                    {/* Event Venue */}
                    <div className="space-y-3">
                      <h2 className="section-title">Event Venue</h2>
                      <input
                        type="text"
                        value={eventVenue}
                        onChange={(e) => setEventVenue(e.target.value)}
                        placeholder="Enter event venue"
                        className="form-input"
                      />
                    </div>
                      <br></br>
                    {/* Event Date */}
                    <div className="space-y-3">
                      <h2 className="section-title">Event Date</h2>

                      <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                          <label>From</label>
                          <input
                            type="datetime-local"
                            value={eventStart}
                            onChange={(e) => setEventStart(e.target.value)}
                            className="form-input !w-[200px]"
                          />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                          <label>To</label>
                          <input
                            type="datetime-local"
                            value={eventEnd}
                            onChange={(e) => setEventEnd(e.target.value)}
                          className="form-input !w-[210px]"
                          />
                        </div>
                      </div>
                    </div>
               
                     <br></br>
                  
                    {/* Maximum Attendees */}
                    <div className="space-y-3">
                      <h2 className="section-title">Maximum Attendees (Optional)</h2>
                      <input
                        type="number"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(e.target.value)}
                        placeholder="Enter maximum attendees"
                        className="form-input"
                      />
                    </div>

                </div>
   {/* Column 2 */}
                  {/* Menu */}
                  <div className="space-y-1">
                       <h2 className="other-title">Other Settings</h2>
                    <div className="flex items-center justify-between gap-2">
                      
                      <div>
                        <h2 className="section-title">Menu Preference</h2>
                      </div>

                     <label className="flex items-center gap-3 cursor-pointer">
                        <span className="text-sm font-medium">
                          {showMenuInForm ? "On" : "Off"}
                        </span>

                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={showMenuInForm}
                            onChange={(e) => setShowMenuInForm(e.target.checked)}
                            className="sr-only peer"
                          />

                          <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>

                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                        </div>
                      </label>
                    </div>

                    {showMenuInForm &&
                      menuOptions.map((option, index) => (
                        <div key={index} className="menu-card">
                          <input
                            value={option}
                            onChange={(e) => updateMenuOption(index, e.target.value)}
                            className="form-input !w-[270px] !h-[40px]"
                          />

                          <button
                            onClick={() => removeMenuOption(index)}
                            className="delete-btn !w-[80px] !h-[40px]"
                          >
                            <Trash2 size={15} />
                          </button>

                          <button onClick={addMenuOption} className="primary-btn !w-[80px] !h-[40px]">
                            <Plus size={19} />
                          
                          </button>
                        </div>
                      ))}
                       {/* Accept Responses */}
                
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="section-title">Accept Responses</h2>

                      <label className="flex items-center gap-3 cursor-pointer">
                          <span className="text-sm font-medium">
                            {showAcceptResponses ? "On" : "Off"}
                          </span>

                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={showAcceptResponses}
                              onChange={(e) => setShowAcceptResponses(e.target.checked)}
                              className="sr-only peer"
                            />

                            <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-300"></div>

                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                          </div>
                        </label>
                    </div>

                    {showAcceptResponses && (
                      <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                          <label>From</label>
                          <input
                            type="datetime-local"
                            value={registrationStart}
                            onChange={(e) => setRegistrationStart(e.target.value)}
                            className="form-input !w-[200px]"
                          />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                          <label>To</label>
                          <input
                            type="datetime-local"
                            value={registrationEnd}
                            onChange={(e) => setRegistrationEnd(e.target.value)}
                            className="form-input !w-[210px]"
                          />
                          </div>
                        </div>
                      )}
                    </div>
              
                  {/* Loot Bags & Souvenirs */}
                   <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h2 className="section-title">Loot Bags & Souvenirs</h2>
                      </div>

                     <label className="flex items-center gap-3 cursor-pointer">
                          <span className="text-sm font-medium">
                            {showLootBags ? "On" : "Off"}
                          </span>

                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={showLootBags}
                              onChange={(e) => setShowLootBags(e.target.checked)}
                              className="sr-only peer"
                            />

                            <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>

                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                          </div>
                        </label>
                    </div>

                    {showLootBags &&
                      lootBagOptions.map((option, index) => (
                        <div key={index} className="menu-card">
                          <input
                            value={option}
                            onChange={(e) =>
                              updateLootBagOption(index, e.target.value)
                            }
                            className="form-input !w-[270px] !h-[40px]"
                            placeholder="Enter loot bag / souvenir item"
                          />

                          <button
                            onClick={() => removeLootBagOption(index)}
                            className="delete-btn !w-[80px] !h-[40px]"
                          >
                            <Trash2 size={15} />
                          </button>

                          <button
                            onClick={addLootBagOption}
                            className="primary-btn !w-[80px] !h-[40px]"
                          >
                            <Plus size={19} />
                          </button>
                        </div>
                      ))}
                                              {/* Upload Banner */}
                          <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h2 className="section-title">Upload Banner</h2>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                  <span className="text-sm font-medium">
                                    {showBannerUpload ? "On" : "Off"}
                                  </span>

                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={showBannerUpload}
                                      onChange={(e) => setShowBannerUpload(e.target.checked)}
                                      className="sr-only peer"
                                    />

                                    <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>

                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                                  </div>
                                </label>
                          </div>

                          {showBannerUpload && (
                            <div className="menu-card mt-3">
                              <input
                                type="text"
                                value={bannerText}
                                onChange={(e) => setBannerText(e.target.value)}
                                placeholder="Enter banner name"
                                className="form-input !w-[320px] !h-[40px]"
                              />

                              <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="primary-btn !w-[120px] !h-[40px]"
                              >
                                Upload
                              </button>

                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                              />
                            </div>
                          )}
                        </div>
                   </div>
                   <div className="template-actions">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="draft-btn"
                    >
                      Save Draft
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveTemplate}
                      className="generate-btn"
                    >
                      Generate Form
                    </button>
                   </div> 
              </div>

              
 


            </div>
          </div>
      </div>

  );
};

export default CreateForm;