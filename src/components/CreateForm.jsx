import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Trash2, SquarePen, Users, CalendarDays, Clock, Settings} from "lucide-react";
import {
  createEvent,
  publishEvent,
  getEventById,
  updateEvent,
} from "../services/eventService";
import "./CreateForm.css";

const CreateForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editEvent = location.state;
  const isEdit = !!editEvent;

  const [formTitle] = useState("Registration Form");

  const [description, setDescription] = useState();

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

  // NEW: Attire
  const [attire, setAttire] = useState("");

  const [checkInTime, setCheckInTime] = useState("");
const [lunchTime, setLunchTime] = useState("");
  // Event Dates
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");

  // Registration Dates (Accept Responses)
  const [registrationStart, setRegistrationStart] = useState("");
  const [registrationEnd, setRegistrationEnd] = useState("");
//Lootbags and Souvenir
const [includesLootBag, setIncludesLootBag] = useState(false);

const [includesSouvenir, setIncludesSouvenir] = useState(false);
  // Banner
  const [banner, setBanner] = useState("");

  // Inquiry Contacts
  const [eventInquiryContact, setEventInquiryContact] = useState();

  // Consent Message
  const [eventConsentMessage, setEventConsentMessage] = useState();

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
const formatDateTimeForAPI = (date) => {
  if (!date) return null;

  // 2026-08-10T08:00 -> 2026-08-10 08:00:00
  return date.replace("T", " ") + ":00";
};

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

const formatDateTime = (date) => {
  if (!date) return "";

  // Convert "July 25, 2026 at 08:00 AM"
  const formatted =
    typeof date === "string"
      ? date.replace(" at ", " ")
      : date;

  const d = new Date(formatted);

  if (isNaN(d.getTime())) {
    console.error("Invalid date:", date);
    return "";
  }

  return d.toISOString().slice(0, 16);
};

//Save Draft
 const handleSaveDraft = async () => {
  const eventData = {
  title: eventName,
  description: eventDescription,
  venue: eventVenue,

  startDate: eventStart ? eventStart.split("T")[0] : null,
  endDate: eventEnd ? eventEnd.split("T")[0] : null,

  requiresMealPreference: showMenuInForm,
  mealPreferences: showMenuInForm ? menuOptions : [],

  isRegistrationRequired: true,

  dressCode: attire || null,

  maxParticipants: maxParticipants
    ? Number(maxParticipants)
    : null,

 checkInTime: checkInTime
  ? checkInTime.substring(0, 5)
  : null,

lunchTime: lunchTime
  ? lunchTime.substring(0, 5)
  : null,

  includesDoorPrize: showLootBags,

  registrationStart: formatDateTimeForAPI(registrationStart),

registrationEnd: formatDateTimeForAPI(registrationEnd),
};

  try {
    if (isEdit) {
      const response = await updateEvent(editEvent.id, eventData);

      if (response.success || response.data) {
        alert("Draft updated successfully!");
        navigate("/draft-events");
      }
    } else {
      const response = await createEvent(eventData);

      if (response.success) {
        alert("Draft saved successfully!");
        navigate("/draft-events");
      }
    }
  } catch (error) {
    console.error(error.response?.data || error);
    console.table(event);
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
  mealPreferences: showMenuInForm ? menuOptions : [],

  isRegistrationRequired: true,

  dressCode: attire || null,
   
 checkInTime: checkInTime
  ? checkInTime.substring(0, 5)
  : null,

lunchTime: lunchTime
  ? lunchTime.substring(0, 5)
  : null,


  maxParticipants: maxParticipants
    ? Number(maxParticipants)
    : null,

  includesDoorPrize: showLootBags,

  registrationStart: formatDateTimeForAPI(registrationStart),

registrationEnd: formatDateTimeForAPI(registrationEnd),
};
  try {
    // ======================
    // UPDATE EXISTING EVENT
    // ======================
    if (isEdit) {
      await updateEvent(editEvent.id, eventData);

      alert("Event updated successfully!");

      navigate("/draft-events");
      return;
    }

    // ======================
    // CREATE NEW EVENT
    // ======================
    const createResponse = await createEvent(eventData);

    if (createResponse.success) {
      // Publish immediately
      await publishEvent(createResponse.data.id);

      alert("Event published successfully!");

      // Open preview/registration page in a NEW TAB
      window.open(
        `/registration/${createResponse.data.id}`,
        "_blank"
      );

      // Current tab goes to Published Events
      navigate("/published-events");
    }
  } catch (error) {
    console.error(error.response?.data || error);
    alert(error.response?.data?.message || "Failed to save event");
  }
};
// Edit Event
useEffect(() => {
  if (!editEvent?.id) return;

  const loadEvent = async () => {
    try {
      const response = await getEventById(editEvent.id);

      console.log("Full Event:", response);

      const event = response.data || response;

      setEventName(event.title || "");
      setEventVenue(event.venue || "");
      setEventDescription(event.description || "");

      setEventStart(formatDateTime(event.startDate));
      setEventEnd(formatDateTime(event.endDate));
      setRegistrationStart(formatDateTime(event.registrationStart));
      setRegistrationEnd(formatDateTime(event.registrationEnd));

      setCheckInTime(event.checkInTime || "");
      setLunchTime(event.lunchTime || "");

      // setMaxParticipants(event.maxParticipants || "");
      setShowMenuInForm(event.requiresMealPreference || false);
      setMenuOptions(event.mealPreferences || []);
      setAttire(event.dressCode || "");
      setMaxParticipants(event.maxParticipants || "");
      setShowLootBags(event.includesDoorPrize || false);
      setShowAcceptResponses(!!event.registrationStart);
    } catch (err) {
      console.error(err);
    }
  };

  loadEvent();
}, [editEvent]);

  return (
    <div className="create-event-page">
      <div className="page-header">
        <div>
          <span>{isEdit ? "Edit Event Form" : "Create Event Registration Form"}</span>
        </div>
      </div>

      <div className="create-event-wrapper">
          <div className="create-form-layout">

            {/* LEFT COLUMN */}
              <div className="left-column">

                  {/* Event Information Card */}
                  <div className="form-card">
                      {/* existing Event Information fields go here */}
                      <div className="card-header">
                        <div className="card-icon blue">
                            <CalendarDays size={26}/>
                        </div>

                        <div>
                            <h3>Event Information</h3>
                            <p>Provide the basic details of your event.</p>
                        </div>
                    </div>
                  
                    <div className="form-content">
                      {/* Event Name */}
                        <div className="form-group">
                            <label>
                                Event Name <span>*</span>
                            </label>

                            <input
                                type="text"
                                className="form-input"

                                value={eventName}
                                onChange={(e)=>setEventName(e.target.value)}
                                placeholder="Enter event name"
                                required
                            />
                        </div>
                      {/* Description */}
                        <div className="form-group">
                            <label>Event Description</label>
                            <textarea
                                className="form-textarea"
                                value={eventDescription}
                                onChange={(e)=>setEventDescription(e.target.value)}
                                placeholder="Enter event description"
                            />
                        </div>
                      {/* Venue + Event Type */}
                        <div className="row-2">
                          <div className="form-group">
                                <label>
                                    Event Venue <span>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={eventVenue}
                                    onChange={(e)=>setEventVenue(e.target.value)}
                                    placeholder="Enter venue"
                                    required
                                />
                          </div> 
                          <div className="form-group">
                                <label>
                                    Attire 
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={attire}
                                    onChange={(e)=>setAttire(e.target.value)}
                                    placeholder="Enter attire requirements"
                                 
                                />
                          </div>  
                        </div>  
                        {/* Start / End */}

                      <div className="row-2">
                        <div className="form-group">
                          <label>
                              Start Date <span>*</span>
                          </label>
                          <input
                              type="datetime-local"
                              value={eventStart}
                              onChange={(e) => setEventStart(e.target.value)}
                              className="form-input"
                              required
                          />
                        </div>
                        <div className="form-group">
                            <label>
                                End Date <span>*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={eventEnd}
                                onChange={(e) => setEventEnd(e.target.value)}
                                className="form-input"
                            />
                        </div>
                      </div>
                      
                      {/* Maximum */}
                      <div className="form-group">
                        <label>
                            Maximum Attendees
                        </label>
                          <input
                              type="number"
                              value={maxParticipants}
                              onChange={(e) => setMaxParticipants(e.target.value)}
                              placeholder="Enter maximum attendees"
                              className="form-input"
                          />
                      </div>
                      {/* Accept Responses */}

                          <div className="row-2">

                            <div className="form-group">
                              <label>
                                Accept Response Start Date <span>*</span>
                              </label>

                              <input
                                type="datetime-local"
                                value={registrationStart}
                                onChange={(e) => setRegistrationStart(e.target.value)}
                                className="form-input"
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>
                                Accept Response End Date <span>*</span>
                              </label>

                              <input
                                type="datetime-local"
                                value={registrationEnd}
                                onChange={(e) => setRegistrationEnd(e.target.value)}
                                className="form-input"
                                required
                              />
                            </div>
                          </div>
                          {/* Event Times */}

                              <div className="row-2">

                                <div className="form-group">
                                  <label>
                                    Registration Start Time
                                  </label>

                                  <input
                                    type="time"
                                    value={checkInTime}
                                    onChange={(e) => setCheckInTime(e.target.value)}
                                    className="form-input"
                                  />
                                </div>

                                <div className="form-group">
                                  <label>
                                    Lunch Time
                                  </label>

                                  <input
                                    type="time"
                                    value={lunchTime}
                                    onChange={(e) => setLunchTime(e.target.value)}
                                    className="form-input"
                                  />
                                </div>

                              </div>

                    </div>
                </div>
              </div>  

            {/* RIGHT COLUMN */}
              <div className="right-column">

                 
                  {/* Settings Card */}
                        {/* ================= Event Settings ================= */}

                        <div className="form-card">

                          <div className="card-header">
                            <div className="card-icon orange">
                              <Settings size={26}/>
                            </div>

                            <div>
                              <h3>Event Settings</h3>
                              <p>Configure event registration options.</p>
                            </div>
                          </div>
                       <div className="card-body settings-body scrollable-settings">
                          <div className="card-body settings-body">

                            {/* ================= Meal Preference ================= */}

                            <div className="setting-block">

                              <div className="setting-item">

                                <div className="setting-info">
                                  <h4>Meal Preference</h4>
                                  <p>Allow attendees to select their preferred meal.</p>
                                </div>
                               
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={showMenuInForm}
                                    onChange={(e) => setShowMenuInForm(e.target.checked)}
                                  />
                                  <span className="slider"></span>
                                </label>

                              </div>

                              {showMenuInForm && (

                                <div className="setting-content">

                                  {menuOptions.map((option, index) => (

                                    <div key={index} className="option-row">

                                      <input
                                        value={option}
                                        onChange={(e) =>
                                          updateMenuOption(index, e.target.value)
                                        }
                                        className="form-input"
                                        placeholder="Meal option"
                                      />

                                      <button
                                        type="button"
                                        onClick={() => removeMenuOption(index)}
                                        className="icon-btn delete"
                                      >
                                        <Trash2 size={17}/>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={addMenuOption}
                                        className="icon-btn add"
                                      >
                                        <Plus size={17}/>
                                      </button>

                                    </div>

                                  ))}

                                </div>

                              )}

                            </div>


                            {/* ================= Complimentaries ================= */}

                            <div className="setting-block">

                              <div className="setting-item">

                                <div className="setting-info">
                                  <h4>Complimentaries</h4>
                                  <p>Choose complimentary items for attendees.</p>
                                </div>

                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={showLootBags}
                                    onChange={(e)=>setShowLootBags(e.target.checked)}
                                  />
                                  <span className="slider"></span>
                                </label>

                              </div>

                              {showLootBags && (

                                <div className="setting-content">

                                  <div className="checkbox-group">

                                    <label className="checkbox-item">

                                      <input
                                        type="checkbox"
                                        checked={includesLootBag}
                                        onChange={(e)=>setIncludesLootBag(e.target.checked)}
                                      />

                                      <span>Loot Bags</span>

                                    </label>

                                    <label className="checkbox-item">

                                      <input
                                        type="checkbox"
                                        checked={includesSouvenir}
                                        onChange={(e)=>setIncludesSouvenir(e.target.checked)}
                                      />

                                      <span>Souvenirs</span>

                                    </label>

                                  </div>

                                  {(includesLootBag || includesSouvenir) &&

                                    lootBagOptions.map((option,index)=>(

                                      <div
                                        key={index}
                                        className="option-row"
                                      >

                                        <input
                                          value={option}
                                          onChange={(e)=>
                                            updateLootBagOption(index,e.target.value)
                                          }
                                          className="form-input"
                                          placeholder="Complimentary item"
                                        />

                                        <button
                                          type="button"
                                          onClick={()=>removeLootBagOption(index)}
                                          className="icon-btn delete"
                                        >
                                          <Trash2 size={17}/>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={addLootBagOption}
                                          className="icon-btn add"
                                        >
                                          <Plus size={17}/>
                                        </button>

                                      </div>

                                    ))

                                  }

                                </div>

                              )}

                            </div>


                            {/* ================= Upload Banner ================= */}

                            <div className="setting-block">

                              <div className="setting-item">

                                <div className="setting-info">
                                  <h4>Upload Banner</h4>
                                  <p>Display a banner on the registration page.</p>
                                </div>

                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={showBannerUpload}
                                    onChange={(e)=>setShowBannerUpload(e.target.checked)}
                                  />
                                  <span className="slider"></span>
                                </label>

                              </div>

                              {showBannerUpload && (

                                <div className="setting-content">

                                  <div className="option-row">

                                    <input
                                      type="text"
                                      value={bannerText}
                                      onChange={(e)=>setBannerText(e.target.value)}
                                      placeholder="Banner name"
                                      className="form-input"
                                    />

                                    <button
                                      type="button"
                                      className="upload-btn"
                                      onClick={()=>fileInputRef.current.click()}
                                    >
                                      Upload
                                    </button>

                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      className="hidden"
                                    />

                                  </div>

                                </div>

                              )}

                            </div>

                          </div>

                        </div>
                        </div>

                  <div className="template-actions">
                    <button
                      type="button"
                      className="draft-btn"
                      onClick={() => {
                        if (isEdit) {
                          navigate("/draft-events");
                        } else {
                          handleSaveDraft();
                        }
                      }}
                    >
                      {isEdit ? "Cancel" : "Save Draft"}
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveTemplate}
                      className="generate-btn"
                    >
                       {isEdit ? "Update Event" : "Generate Form"}
                    </button>
                   </div> 


              </div>
          </div>
      </div>
    </div>
 
  );
};

export default CreateForm;