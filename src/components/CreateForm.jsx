import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Divide, Plus, Trash2 } from "lucide-react";
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
- Patricia Tombo +639171248773 or patricia.tombo@asc.com.ph

Consent: By signing this Event Consent form, I willingly authorize its Organizers to process my personal data for the sole purpose of achieving the objectives of this event dubbed "National Summit on Progressive and Fair Advertising Self Regulation." I entrust that my personal data shall be given utmost care and confidentiality by the Event Organizers and that this shall not be used outside the objectives and purpose above-stated.`
  );
   const [eventDescription, setEventDescription] = useState(
    "Please fill out all required information"
  );
  const [eventName, setEventName] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventInquiryContact, setEventInquiryContact] = useState(`- Digna Santos +639189032173 or digna.santos@asc.com.ph
- Bree Muyco +639561503875 or breanna.muyco@asc.com.ph
- Patricia Tombo +639171248773 or patricia.tombo@asc.com.ph`);
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [banner, setBanner] = useState("");
  const [eventConsentMessage, setEventConsentMessage] = useState(`By accepting this Event Consent form, I willingly authorize its Organizers to process my personal data for the sole purpose of achieving the objectives of this event dubbed "National Summit on Progressive and Fair Advertising Self Regulation." I entrust that my personal data shall be given utmost care and confidentiality by the Event Organizers and that this shall not be used outside the objectives and purpose above-stated.`);
  const [eventFormInstructions, setEventFormInstructions] = useState("Please fill out all required information");
  
  // Ref to access hidden file input element
  const fileInputRef = useRef(null);

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

  const [menuOptions, setMenuOptions] = useState([
    "Pork",
    "Fish",
    "Chicken",
  ]);
  const [showMenuInForm, setShowMenuInForm] = useState(true);
  React.useEffect(() => {
    const editData = localStorage.getItem("ascEventEdit")
    if (editData) {
      try {
        const parsed = JSON.parse(editData)
        setEventDescription(parsed.eventDescription || eventDescription)
        setEventFormInstructions(parsed.eventFormInstructions || eventFormInstructions)
        setEventName(parsed.eventName || eventName)
        setEventVenue(parsed.eventVenue || eventVenue)
        setEventInquiryContact(parsed.eventInquiryContact || eventInquiryContact)
        setEventStart(parsed.eventStart || eventStart)
        setEventEnd(parsed.eventEnd || eventEnd)
        setEventConsentMessage(parsed.eventConsentMessage || eventConsentMessage)
        setBanner(parsed.banner || banner)
        setFields(parsed.fields || fields)
        setMenuOptions(parsed.menuOptions || menuOptions)
        setShowMenuInForm(parsed.showMenuInForm ?? showMenuInForm)
      } catch (error) {
        console.error("Failed to load edit template", error)
      } finally {
        localStorage.removeItem("ascEventEdit")
      }
    }
  }, [])
  const addField = () =>
    setFields([...fields, { label: "", type: "text", required: false }]);

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const removeField = (index) =>
    setFields(fields.filter((_, i) => i !== index));

  const addMenuOption = () =>
    setMenuOptions([...menuOptions, ""]);

  const updateMenuOption = (index, value) => {
    const updated = [...menuOptions];
    updated[index] = value;
    setMenuOptions(updated);
  };

  const removeMenuOption = (index) =>
    setMenuOptions(menuOptions.filter((_, i) => i !== index));

  // Handle banner file upload - triggered when user selects file from file manager
  const handleBannerUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a URL for the selected image file
      const fileUrl = URL.createObjectURL(file);
      setBanner(fileUrl);
      console.log("Banner uploaded:", file.name);
    }
  };

  // Trigger file manager when Upload Banner button is clicked
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
 
  const STORAGE_KEY = "ascEventTemplates";

  const saveTemplateToStorage = (template) => {
    const existing = localStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([template, ...parsed]));
  };

  // Save template and navigate to the registration page
  const handleSaveTemplate = () => {
    const template = {
      id: Date.now(),
      fields,
      menuOptions,
      showMenuInForm,
      eventDescription,
      eventFormInstructions,
      eventName,
      eventVenue,
      eventStart,
      eventEnd,
      eventInquiryContact,
      eventConsentMessage,
      banner,
      savedAt: new Date().toISOString(),
    };

    saveTemplateToStorage(template);

    navigate("/registration", {
      state: template,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex justify-center p-6 text-[12px]">
      <div className="w-full max-w-4xl">
        <div className="form-container">

          <h1 className="form-title">
            Create an Event Registration Form
          </h1>

          {/* Banner */}
          <div className="space-y-3">
            <h2 className="section-title">Banner Setup</h2>

            <input
              type="text"
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              placeholder="Upload banner image"
              className="form-input"
            />
            
            {/* Hidden file input - triggers file manager when upload button is clicked */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              style={{ display: "none" }}
            />
            
            {/* Upload Banner Button - opens device file manager on click */}
            <button onClick={triggerFileInput} className="primary-btn mt-3">
              <Plus size={15} />
              Upload
            </button>
            {banner && (
              <img
                src={banner}
                alt="banner"
                className="banner-preview"
              />
            )}
            
          </div>
          {/* Event Name */}
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

          {/* Event Date */}
          <div className="space-y-3">
            <h2 className="section-title">Event Date</h2>

            <div className="flex flex-col gap-4 md:flex-row md:items-end"><div className="flex flex-col md:flex-row md:items-center gap-2 flex-1"><label className="text-sm font-medium text-slate-700">From</label><input type="datetime-local" value={eventStart} onChange={(e) => setEventStart(e.target.value)} className="form-input flex-1" /></div><div className="flex flex-col md:flex-row md:items-center gap-2 flex-1"><label className="text-sm font-medium text-slate-700">To</label><input type="datetime-local" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} className="form-input flex-1" /></div></div>
          </div>
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

           {/* Event Inquiry Contact */}
          <div className="space-y-3">
            <h2 className="section-title">Event Inquiry Contact</h2>

            <textarea
              value={eventInquiryContact}
              onChange={(e) => setEventInquiryContact(e.target.value)}
              placeholder="Enter event inquiry contact"
              className="form-input"
            />
          </div>
          {/* Event Consent */}
          <div className="space-y-3">
            <h2 className="section-title">Event Consent Message</h2>

            <textarea
              value={eventConsentMessage}
              onChange={(e) => setEventConsentMessage(e.target.value)}
              className="form-input"
              rows="4"
              placeholder="Event Consent Message"
            />
          </div>

          {/* Form Instructions */}
          <div className="space-y-3">
            <h2 className="section-title">Form Instructions</h2>

            <textarea
              value={eventFormInstructions}
              onChange={(e) => setEventFormInstructions(e.target.value)}
              className="form-input"
              rows="4"
              placeholder="Form Instructions"
            />
          </div>
           
          {/* Registration Fields */}
          <div className="space-y-6">
            <h2 className="section-title">Registration Fields</h2>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="field-card">

                  <input
                    value={field.label}
                    onChange={(e) =>
                      updateField(index, "label", e.target.value)
                    }
                    className="form-input flex-1 min-w-[120px]"
                    placeholder="Field label"
                  />

                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateField(index, "type", e.target.value)
                    }
                    className="form-select"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="radio">Radio</option>
                  </select>

                  <label className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        updateField(index, "required", e.target.checked)
                      }
                    />
                    Required
                  </label>
               
                  <button
                    onClick={() => removeField(index)}
                    className="delete-btn"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <br />
            <button onClick={addField} className="primary-btn">
              <Plus size={18} />
              Add Field
            </button>
          </div>

          {/* Menu Reference */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="section-title">Menu Reference</h2>
                <p className="text-sm text-slate-500">Toggle to include this section in the registration form.</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={showMenuInForm}
                  onChange={(e) => setShowMenuInForm(e.target.checked)}
                  className="accent-blue-500"
                />
                Show in registration
              </label>
            </div>

            {showMenuInForm && (
              <>
                <div className="space-y-3">
                  {menuOptions.map((option, index) => (
                    <div key={index} className="menu-card">
                      <input
                        value={option}
                        onChange={(e) => updateMenuOption(index, e.target.value)}
                        className="form-input flex-1"
                      />

                      <button
                        onClick={() => removeMenuOption(index)}
                        className="delete-btn"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <br />
                <button onClick={addMenuOption} className="primary-btn">
                  <Plus size={18} />
                  Add Menu Option
                </button>
              </>
            )}
          </div>
          <br />
          {/* Accept Responses */}
          <div className="space-y-3">
            <h2 className="section-title">Form Settings: </h2>
            <h2 className="section-title">Accept Responses</h2>

            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                <label className="text-sm font-medium text-slate-700">From</label>
                <input
                  type="datetime-local"
                  value={eventStart}
                  onChange={(e) => setEventStart(e.target.value)}
                  className="form-input flex-1"
                />
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                <label className="text-sm font-medium text-slate-700">To</label>
                <input
                  type="datetime-local"
                  value={eventEnd}
                  onChange={(e) => setEventEnd(e.target.value)}
                  className="form-input flex-1"
                />
              </div>
            </div>
          </div>

        <br />
        <div className="template-actions">
          {/* Draft */}
          <button type="button" onClick={handleSaveTemplate} className="draft-btn">
            Save Draft
          </button>
           {/* Draft */}
          <button type="button" onClick={handleSaveTemplate} className="generate-btn">
            Generate Form
          </button>

         </div>
        </div>
        
      </div>
      
    </div>
  );
};

export default CreateForm;