import React from "react";
import { CheckCircle } from "lucide-react";
import "./ThankYou.css";

const ThankYou = () => {
  return (
    <div className="thankyou-page">
      <div className="thankyou-card">
        <div className="success-icon">
          <CheckCircle size={90} strokeWidth={1.8} />
        </div>

        <h1>Your registration has been successfully submitted.</h1>

        <p>
          Our team will contact you through your provided email regarding
          updates about the event.
        </p>
      </div>
    </div>
  );
};

export default ThankYou;