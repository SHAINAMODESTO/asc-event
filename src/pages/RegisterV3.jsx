import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

import Hero from "../components/register/Hero";

import RegisterForm from "./RegisterForm";
import ValidationModal from "../components/register/ValidationModal";
import useRegisterForm from "../hooks/useRegisterForm";
import useEvent from "../hooks/useEvent";
import RegisterConsent from "./RegisterConsent";

const RegisterV3 = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const { event, loading } = useEvent(eventId);

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  const register = useRegisterForm(eventId, navigate);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!privacyAccepted) {
    return (
      <RegisterConsent
        event={event}
        contact={"Bree Muyco +639561503875 or breanna.muyco@asc.com.ph"}
        privacyChecked={privacyChecked}
        setPrivacyChecked={setPrivacyChecked}
        onContinue={() => setPrivacyAccepted(true)}
        onCancel={() => navigate("/")}
      />
    );
  }

  return (
    <>
      <Hero
        banner={event.banner}
        title={event.title}
        description={event.description}
      />

      <RegisterForm {...register} event={event} />

      <ValidationModal
        open={register.showValidation}
        errors={register.validationErrors}
        onClose={() => register.setShowValidation(false)}
      />
    </>
  );
};

export default RegisterV3;
