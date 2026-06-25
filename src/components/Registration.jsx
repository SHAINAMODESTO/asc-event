import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Registration.css";

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");

  const {
    menuOptions = [],
    showMenuInForm = true,
    eventName = "",
    eventVenue = "",
    eventStart = "",
    eventEnd = "",
    eventInquiryContact = "",
    eventConsentMessage = "",
    eventDescription = "",
    banner = "",
  } = location.state || {};

  const navigateHome = () => navigate("/", { replace: true });

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      firstName,
      lastName,
      middleInitial,
      preferredName,
      email,
      contactNumber,
      companyName,
      position,
    };

    console.log(formData);
    alert("Registration Submitted!");
  };

  return (
    <div className="registration-page">
      {!consentAccepted ? (
        <div className="consent-modal-overlay">
          <div className="consent-modal">
            <h2>{eventName} Registration</h2>

            <div className="consent-grid-two">
              <div className="consent-card">
                <h3>Event Venue</h3>
                <p>{eventVenue}</p>
              </div>

              <div className="consent-card">
                <h3>Date & Time</h3>
                <p>
                  {eventStart} - {eventEnd}
                </p>
              </div>
            </div>

            <div className="consent-card">
              <h3>Inquiry Contact</h3>
              <p>{eventInquiryContact}</p>
            </div>

            <div className="consent-card">
              <label>
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                />{" "}
                {eventConsentMessage}
              </label>
            </div>

            <div className="consent-actions">
              <button className="ccancel-btn" onClick={navigateHome}>
                Cancel
              </button>

              <button
                className="caccept-btn"
                disabled={!consentChecked}
                onClick={() => setConsentAccepted(true)}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Banner */}
          <div className="hero-banner">
            {banner && (
              <img src={banner} alt="Banner" className="hero-image" />
            )}

            <div className="hero-overlay">
              <h3>{eventName}  Registration Form</h3>
              <p>{eventDescription}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="registration-wrapper">
            {/* Event Info */}
            <div className="event-info">
              <div className="info-card">
                <h3>📍 Venue</h3>
                <p>{eventVenue}</p>
              </div>

              <div className="info-card">
                <h3>📅 Schedule</h3>
                <p>
                 From: {eventStart}
                 <br></br>
                  To:   {eventEnd}
                </p>
              </div>

              <div className="info-card">
                <h3>📞 Contact</h3>
                <p>{eventInquiryContact}</p>
              </div>
            </div>

            {/* Form */}
            <div className="form-container">
               
              
              <form className="reg-form" onSubmit={handleSubmit}>
               
                  
                <div className="form-grid">
                 
                  <label>
                    First Name  </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                 
                  <label >
                    Last Name </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  

                  <label>
                    Middle Initial  </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter middle initial"
                      maxLength="1"
                      value={middleInitial}
                      onChange={(e) => setMiddleInitial(e.target.value)}
                    />
                 

                  <label>
                    Preferred Name for ID  </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter preferred name"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                    />
                 

                  <label >
                    Email Address   </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                

                  <label >
                    Contact Number  </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Enter contact number"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                 

                  <label>
                    Company Name </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  

                  <label>
                    Position  </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    />
                 
                </div>

                {/* Menu */}
                {showMenuInForm && menuOptions.length > 0 && (
                  <div className="menu-wrapper">
                <fieldset className="menu-box">
                <legend>Menu Reference</legend>

                <div className="menu-list">
                  {menuOptions.map((option, index) => (
                    <label key={index} className="menu-option">
                      <input type="radio" name="menu" />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
                )}

                {/* Consent */}
                <div className="consent-box">
                  <input type="checkbox" required />
                  <p>
                    I HEREBY CERTIFY that the information provided in this form is complete, true and correct to the best of my knowledge.  

                    FURTHER, I HEREBY ACKNOWLEDGE that I have read and understood the Privacy Notice 
                    and agree there to as well. I give my consent to collect, use and process my personal information.
                     I understand that my consent does not preclude the existence of other criteria for lawful processing
                      of personal data, and does not waive any of my rights under the Data Privacy Act of 2012 
                      and other applicable laws.
                  </p>
                </div>

                <button type="submit" className="submit-btn">
                  Submit Registration
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={navigateHome}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Register;