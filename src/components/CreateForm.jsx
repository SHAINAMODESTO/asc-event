import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Trash2, SquarePen, Users, CalendarDays, Clock, Settings, NotebookPen, ImagePlus} from "lucide-react";
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

  // Lootbags and Souvenir
  const [includesLootBag, setIncludesLootBag] = useState(false);

  const [includesSouvenir, setIncludesSouvenir] = useState(false);

  // NEW: Door Prize
  const [includesDoorPrizes, setIncludesDoorPrizes] = useState(false);

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
  const [bannerPreview, setBannerPreview] = useState("");

  // Attendee Profile Photo Requirement
  const [requiresProfilePhoto, setRequiresProfilePhoto] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const profilePhotoInputRef = useRef(null);

  // ================================
  // PAID EVENT
  // ================================
  const [isPaidEvent, setIsPaidEvent] = useState(false);
  const [isPaidEventConfigured, setIsPaidEventConfigured] = useState(false);
  const [showPaidEventModal, setShowPaidEventModal] = useState(false);
  const [currency, setCurrency] = useState("PHP");
  const [ticketTiers, setTicketTiers] = useState([
    { name: "", price: "", cutoff: "" },
  ]);
  const [paymentInstructions, setPaymentInstructions] = useState("");

  const currencySymbols = {
    PHP: "₱",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const handlePaidEventToggle = (checked) => {
    setIsPaidEvent(checked);

    if (checked) {
      setShowPaidEventModal(true);
    }
  };

  const addTicketTier = () =>
    setTicketTiers([...ticketTiers, { name: "", price: "", cutoff: "" }]);

  const updateTicketTier = (index, key, value) => {
    const updated = [...ticketTiers];
    updated[index][key] = value;
    setTicketTiers(updated);
  };

  const removeTicketTier = (index) =>
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));

  const handleCancelPaidEventModal = () => {
    if (!isPaidEventConfigured) {
      setIsPaidEvent(false);
    }

    setShowPaidEventModal(false);
  };

  const handleSavePaidEventConfig = () => {
    setIsPaidEventConfigured(true);
    setShowPaidEventModal(false);
  };

  // ================================
  // COMPANY SLOT ALLOCATION
  // ================================
  // Groups companies that should share the same maximum number of
  // (primary) attendees for this event — e.g. a "Maximum Number: 5"
  // group listing Company A and Company B, and a separate
  // "Maximum Number: 1" group for smaller companies.
  const [isCompanySlotAllocation, setIsCompanySlotAllocation] = useState(false);
  const [isCompanySlotConfigured, setIsCompanySlotConfigured] = useState(false);
  const [showCompanySlotModal, setShowCompanySlotModal] = useState(false);
  const [companySlotGroups, setCompanySlotGroups] = useState([
    { maxNumber: "", companies: [], companyInput: "" },
  ]);
  const [defaultSlotLimit, setDefaultSlotLimit] = useState("");

  const handleCompanySlotToggle = (checked) => {
    setIsCompanySlotAllocation(checked);

    if (checked) {
      setShowCompanySlotModal(true);
    }
  };

  const addCompanySlotGroup = () =>
    setCompanySlotGroups([
      ...companySlotGroups,
      { maxNumber: "", companies: [], companyInput: "" },
    ]);

  const removeCompanySlotGroup = (index) =>
    setCompanySlotGroups(companySlotGroups.filter((_, i) => i !== index));

  const updateCompanySlotGroupField = (index, key, value) => {
    const updated = [...companySlotGroups];
    updated[index] = { ...updated[index], [key]: value };
    setCompanySlotGroups(updated);
  };

  // Splits the group's pasted/typed text on newlines so a coordinator can
  // paste a whole list of company names at once, or type one and click
  // Add — either way it's appended to that group's company list (skipping
  // duplicates already in the list, case-insensitively).
  const addCompaniesToGroup = (index) => {
    const group = companySlotGroups[index];
    const raw = group?.companyInput || "";

    const namesToAdd = raw
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (namesToAdd.length === 0) return;

    const merged = [...group.companies];

    namesToAdd.forEach((name) => {
      const alreadyThere = merged.some(
        (existing) => existing.toLowerCase() === name.toLowerCase()
      );

      if (!alreadyThere) {
        merged.push(name);
      }
    });

    const updated = [...companySlotGroups];
    updated[index] = { ...updated[index], companies: merged, companyInput: "" };
    setCompanySlotGroups(updated);
  };

  const removeCompanyFromGroup = (groupIndex, companyIndex) => {
    const updated = [...companySlotGroups];
    updated[groupIndex] = {
      ...updated[groupIndex],
      companies: updated[groupIndex].companies.filter(
        (_, i) => i !== companyIndex
      ),
    };
    setCompanySlotGroups(updated);
  };

  const handleCancelCompanySlotModal = () => {
    if (!isCompanySlotConfigured) {
      setIsCompanySlotAllocation(false);
    }

    setShowCompanySlotModal(false);
  };

  const handleSaveCompanySlotConfig = () => {
    setIsCompanySlotConfigured(true);
    setShowCompanySlotModal(false);
  };

  const handleBannerFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerPreview(URL.createObjectURL(file));
  };

  const handleRemoveBanner = () => {
    setBannerPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProfilePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePhotoPreview(URL.createObjectURL(file));
  };

  const handleRemoveProfilePhoto = () => {
    setProfilePhotoPreview("");
    if (profilePhotoInputRef.current) {
      profilePhotoInputRef.current.value = "";
    }
  };

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

  // Save Draft
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

      // ================================
      // GIVEAWAYS
      // ================================
      includesLootBag: includesLootBag,
      includesSouvenir: includesSouvenir,
      includesDoorPrize: includesDoorPrizes,

      registrationStart: formatDateTimeForAPI(registrationStart),

      registrationEnd: formatDateTimeForAPI(registrationEnd),

      // NOTE: requiresProfilePhoto / paid event fields (isPaidEvent, currency,
      // ticketTiers, paymentInstructions) are omitted until the backend supports them.
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

      // ================================
      // GIVEAWAYS
      // ================================
      includesLootBag: includesLootBag,
      includesSouvenir: includesSouvenir,
      includesDoorPrize: includesDoorPrizes,

      registrationStart: formatDateTimeForAPI(registrationStart),

      registrationEnd: formatDateTimeForAPI(registrationEnd),

      // NOTE: requiresProfilePhoto / paid event fields (isPaidEvent, currency,
      // ticketTiers, paymentInstructions) are omitted until the backend supports them.
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
        setRequiresProfilePhoto(event.requiresProfilePhoto || false);
        setMenuOptions(event.mealPreferences || []);
        setAttire(event.dressCode || "");
        setMaxParticipants(event.maxParticipants || "");

        // ================================
        // GIVEAWAYS
        // ================================
        setShowLootBags(
          event.includesLootBag ||
          event.includesSouvenir ||
          event.includesDoorPrize ||
          false
        );

        setIncludesLootBag(event.includesLootBag || false);
        setIncludesSouvenir(event.includesSouvenir || false);
        setIncludesDoorPrizes(event.includesDoorPrize || false);

        setShowAcceptResponses(!!event.registrationStart);

        // ================================
        // PAID EVENT
        // ================================
        setIsPaidEvent(event.isPaidEvent || false);
        setIsPaidEventConfigured(!!event.isPaidEvent);
        setCurrency(event.currency || "PHP");
        setTicketTiers(
          event.ticketTiers?.length
            ? event.ticketTiers.map((tier) => ({
                name: tier.name || "",
                price: tier.price ?? "",
                cutoff: tier.cutoff || "",
              }))
            : [{ name: "", price: "", cutoff: "" }]
        );
        setPaymentInstructions(event.paymentInstructions || "");
      } catch (err) {
        console.error(err);
      }
    };

    loadEvent();
  }, [editEvent]);

  return (
    <div className="create-event-page">
      <div className="all-events-header">
        <div className="header-title">
          <div className="stat-icon blue">
            <NotebookPen size={24} />
          </div>
          <div>
            <h1 className="all-events-title">
              {isEdit
                ? "Edit Event Form"
                : "Create Event Registration Form"}
            </h1>
          </div>
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
                        <p>
                          Allow attendees to select their preferred meal.
                        </p>
                      </div>

                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={showMenuInForm}
                          onChange={(e) => {
                            setShowMenuInForm(e.target.checked);
                            if (e.target.checked && menuOptions.length === 0) {
                              setMenuOptions([""]);
                            }
                          }}
                        />

                        <span className="slider"></span>
                      </label>

                    </div>

                    {showMenuInForm && (

                      <div className="setting-content">

                        {menuOptions.length === 0 && (
                          <button
                            type="button"
                            onClick={addMenuOption}
                            className="icon-btn add"
                          >
                            <Plus size={17}/> Add meal option
                          </button>
                        )}

                        {menuOptions.map((option, index) => (

                          <div
                            key={index}
                            className="option-row"
                          >

                            <input
                              value={option}
                              onChange={(e) =>
                                updateMenuOption(
                                  index,
                                  e.target.value
                                )
                              }
                              className="form-input"
                              placeholder="Meal option"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeMenuOption(index)
                              }
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
                        <p>
                          Choose complimentary items for attendees.
                        </p>
                      </div>

                      <label className="switch">

                        <input
                          type="checkbox"
                          checked={showLootBags}
                          onChange={(e)=>
                            setShowLootBags(e.target.checked)
                          }
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
                              onChange={(e)=>
                                setIncludesLootBag(
                                  e.target.checked
                                )
                              }
                            />

                            <span>Loot Bags</span>

                          </label>

                          <label className="checkbox-item">

                            <input
                              type="checkbox"
                              checked={includesSouvenir}
                              onChange={(e)=>
                                setIncludesSouvenir(
                                  e.target.checked
                                )
                              }
                            />

                            <span>Souvenirs</span>

                          </label>

                          <label className="checkbox-item">

                            <input
                              type="checkbox"
                              checked={includesDoorPrizes}
                              onChange={(e)=>
                                setIncludesDoorPrizes(
                                  e.target.checked
                                )
                              }
                            />

                            <span>Door Prizes</span>

                          </label>

                        </div>



                      </div>

                    )}

                  </div>

                  {/* ================= Upload Banner ================= */}

                  <div className="setting-block">

                    <div className="setting-item">

                      <div className="setting-info">
                        <h4>Upload Registration Banner</h4>
                        <p>
                          Display a banner on the registration page.
                        </p>
                      </div>

                      <label className="switch">

                        <input
                          type="checkbox"
                          checked={showBannerUpload}
                          onChange={(e)=>
                            setShowBannerUpload(
                              e.target.checked
                            )
                          }
                        />

                        <span className="slider"></span>

                      </label>

                    </div>

                    {showBannerUpload && (

                      <div className="setting-content">

                        <input
                          type="text"
                          value={bannerText}
                          onChange={(e)=>
                            setBannerText(e.target.value)
                          }
                          placeholder="Banner name"
                          className="form-input"
                        />

                        <div
                          className={`banner-upload-box${
                            bannerPreview ? " has-preview" : ""
                          }`}
                          onClick={() =>
                            fileInputRef.current.click()
                          }
                        >
                          {bannerPreview ? (
                            <img
                              src={bannerPreview}
                              alt="Registration banner preview"
                              className="banner-upload-preview"
                            />
                          ) : (
                            <>
                              <ImagePlus size={26} />
                              <span>Click to upload banner image</span>
                              <span className="banner-upload-hint">
                                Recommended: wide image, e.g. 1200×400px
                              </span>
                            </>
                          )}
                        </div>

                        {bannerPreview && (
                          <button
                            type="button"
                            className="photo-remove-btn"
                            onClick={handleRemoveBanner}
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleBannerFileSelect}
                        />

                      </div>

                    )}

                  </div>

                  {/* ================= Upload Attendee's Photo ================= */}

                  <div className="setting-block">

                    <div className="setting-item">

                      <div className="setting-info">
                        <h4>Upload Attendee's Profile Photo</h4>
                        <p>
                          Attendees are required to upload a profile picture for identification purposes
                        </p>
                      </div>

                      <label className="switch">

                        <input
                          type="checkbox"
                          checked={requiresProfilePhoto}
                          onChange={(e) =>
                            setRequiresProfilePhoto(e.target.checked)
                          }
                        />

                        <span className="slider"></span>

                      </label>

                    </div>

                    {requiresProfilePhoto && (

                      <div className="setting-content">

                        <div className="photo-upload-row">

                          <div
                            className="photo-upload-box"
                            onClick={() =>
                              profilePhotoInputRef.current.click()
                            }
                          >
                            {profilePhotoPreview ? (
                              <img
                                src={profilePhotoPreview}
                                alt="Sample profile photo"
                                className="photo-upload-preview"
                              />
                            ) : (
                              <>
                                <ImagePlus size={22} />
                                <span>Upload</span>
                              </>
                            )}
                          </div>

                          <div className="photo-upload-info">
                            <p className="photo-upload-title">
                              Sample Photo (optional)
                            </p>
                            <p className="photo-upload-desc">
                              Show attendees an example of an acceptable photo,
                              e.g. plain background, shoulders up.
                            </p>

                            {profilePhotoPreview && (
                              <button
                                type="button"
                                className="photo-remove-btn"
                                onClick={handleRemoveProfilePhoto}
                              >
                                <Trash2 size={14} />
                                Remove
                              </button>
                            )}
                          </div>

                          <input
                            ref={profilePhotoInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleProfilePhotoSelect}
                          />

                        </div>

                      </div>

                    )}

                  </div>

                  {/* ================= Paid Event option ================= */}

                  <div className="setting-block">

                    <div className="setting-item">

                      <div className="setting-info">
                        <h4>Paid Event</h4>
                        <p>
                          Turn on this option to indicate that the event requires a registration fee.
                        </p>
                        {isPaidEvent && isPaidEventConfigured && (
                          <button
                            type="button"
                            className="edit-paid-event-link"
                            onClick={() => setShowPaidEventModal(true)}
                          >
                            <SquarePen size={14} />
                            Edit ticket configuration
                          </button>
                        )}
                      </div>

                      <label className="switch">

                        <input
                          type="checkbox"
                          checked={isPaidEvent}
                          onChange={(e) =>
                            handlePaidEventToggle(e.target.checked)
                          }
                        />

                        <span className="slider"></span>

                      </label>

                    </div>

                  </div>

                  {/* ================= Company Slot Allocation ================= */}

                  <div className="setting-block">

                    <div className="setting-item">

                      <div className="setting-info">
                        <h4>Company Slot Allocation</h4>
                        <p>
                         Allocate a maximum number of attendees per company.
                        </p>
                        {isCompanySlotAllocation && isCompanySlotConfigured && (
                          <button
                            type="button"
                            className="edit-setting-link"
                            onClick={() => setShowCompanySlotModal(true)}
                          >
                            <SquarePen size={14} />
                            Edit slot configuration
                          </button>
                        )}
                      </div>

                      <label className="switch">

                        <input
                          type="checkbox"
                          checked={isCompanySlotAllocation}
                          onChange={(e) =>
                            handleCompanySlotToggle(e.target.checked)
                          }
                        />

                        <span className="slider"></span>

                      </label>

                    </div>

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

      {/* ========================================
          CONFIGURE PAID EVENT MODAL
      ======================================== */}

      {showPaidEventModal && (
        <div
          className="paid-event-modal-overlay"
          onClick={handleCancelPaidEventModal}
        >
          <div
            className="paid-event-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="paid-event-modal-header">
              <div>
                <h2>Configure Paid Event</h2>
                <p>Set ticket tiers and how coordinators will record payment.</p>
              </div>

              <button
                type="button"
                className="paid-event-close-btn"
                onClick={handleCancelPaidEventModal}
              >
                ✕
              </button>
            </div>

            <div className="paid-event-modal-body">

              {/* Currency */}
              <div className="form-group">
                <label>Currency</label>

                <select
                  className="form-input"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="PHP">PHP — Philippine Peso</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="JPY">JPY — Japanese Yen</option>
                </select>
              </div>

              {/* Ticket Tiers */}
              <div className="form-group">
                <label>Ticket Tiers</label>

                <div className="ticket-tiers-table">
                  <div className="ticket-tier-row ticket-tier-row-header">
                    <span>Tier Name</span>
                    <span>Price</span>
                    <span>Cutoff (optional)</span>
                    <span></span>
                  </div>

                  {ticketTiers.map((tier, index) => (
                    <div key={index} className="ticket-tier-row">
                      <input
                        type="text"
                        className="form-input"
                        value={tier.name}
                        onChange={(e) =>
                          updateTicketTier(index, "name", e.target.value)
                        }
                        placeholder="e.g. Early Bird"
                      />

                      <div className="price-input-wrapper">
                        <span className="currency-symbol">
                          {currencySymbols[currency]}
                        </span>
                        <input
                          type="number"
                          className="form-input"
                          value={tier.price}
                          onChange={(e) =>
                            updateTicketTier(index, "price", e.target.value)
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <input
                        type="date"
                        className="form-input"
                        value={tier.cutoff}
                        onChange={(e) =>
                          updateTicketTier(index, "cutoff", e.target.value)
                        }
                      />

                      <button
                        type="button"
                        className="icon-btn delete"
                        onClick={() => removeTicketTier(index)}
                        disabled={ticketTiers.length === 1}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="add-ticket-tier-btn"
                  onClick={addTicketTier}
                >
                  <Plus size={16} />
                  Add Ticket Tier
                </button>
              </div>

              {/* Payment Instructions */}
              <div className="form-group">
                <label>
                  Payment Instructions{" "}
                  <span className="field-hint">— shown to coordinators</span>
                </label>

                <textarea
                  className="form-textarea"
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  placeholder="e.g. Bank transfer: BDO 0012-3456-789 (ASC Com)&#10;GCash: 0917-000-0000"
                  rows={3}
                />
              </div>

              <div className="paid-event-note">
                Payment is metadata only — there is no online payment gateway.
                Coordinators mark someone as “Paid” manually, the same way
                check-in works today.
              </div>

            </div>

            <div className="paid-event-modal-footer">
              <button
                type="button"
                className="cancel-paid-event-btn"
                onClick={handleCancelPaidEventModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="save-paid-event-btn"
                onClick={handleSavePaidEventConfig}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          CONFIGURE COMPANY SLOTS MODAL
      ======================================== */}

      {showCompanySlotModal && (
        <div
          className="company-slot-modal-overlay"
          onClick={handleCancelCompanySlotModal}
        >
          <div
            className="company-slot-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="company-slot-modal-header">
              <div>
                <h2>Configure Company Slots</h2>
                <p>Set a maximum number of attendees per company.</p>
              </div>

              <button
                type="button"
                className="company-slot-close-btn"
                onClick={handleCancelCompanySlotModal}
              >
                ✕
              </button>
            </div>

            <div className="company-slot-modal-body">

              {companySlotGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="config-card">

                  <div className="config-card-header">
                    <h5>Configuration {groupIndex + 1}</h5>

                    <button
                      type="button"
                      className="config-remove-btn"
                      onClick={() => removeCompanySlotGroup(groupIndex)}
                      disabled={companySlotGroups.length === 1}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>

                  {/* Maximum Number */}
                  <div className="form-group max-number-field">
                    <label>Maximum Number</label>

                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={group.maxNumber}
                      onChange={(e) =>
                        updateCompanySlotGroupField(
                          groupIndex,
                          "maxNumber",
                          e.target.value
                        )
                      }
                      placeholder="Example: 5"
                    />

                  
                  </div>

                  {/* Companies */}
                  <div className="form-group">
                    <label>Companies</label>

                    <div className="company-listbox">
                      {group.companies.length === 0 ? (
                        <div className="company-listbox-empty">
                          No companies added yet.
                        </div>
                      ) : (
                        group.companies.map((company, companyIndex) => (
                          <div key={companyIndex} className="company-listbox-row">
                            <span>{company}</span>

                            <button
                              type="button"
                              className="remove-x"
                              onClick={() =>
                                removeCompanyFromGroup(groupIndex, companyIndex)
                              }
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="company-add-row">
                      <textarea
                        className="form-textarea"
                        value={group.companyInput}
                        onChange={(e) =>
                          updateCompanySlotGroupField(
                            groupIndex,
                            "companyInput",
                            e.target.value
                          )
                        }
                        placeholder="Paste company names here, one per line…"
                      />

                      <button
                        type="button"
                        className="add-to-list-btn"
                        onClick={() => addCompaniesToGroup(groupIndex)}
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>

                    <span className="field-hint-block">
                      Paste a list (one company per line) or type one name and click Add.
                    </span>
                  </div>

                </div>
              ))}

              <button
                type="button"
                className="add-config-btn"
                onClick={addCompanySlotGroup}
              >
                <Plus size={16} />
                Create Another Maximum Number Configuration
              </button>

              

              

            </div>

            <div className="company-slot-modal-footer">
              <button
                type="button"
                className="cancel-company-slot-btn"
                onClick={handleCancelCompanySlotModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="save-company-slot-btn"
                onClick={handleSaveCompanySlotConfig}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateForm;