import { useState } from "react";
import { createAttendee } from "../services/attendeeListService";
import { validateRegistration } from "../utils/validation";

export default function useRegisterForm(eventId, navigate) {
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const [validationErrors, setValidationErrors] = useState([]);

  const [showValidation, setShowValidation] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const handleSubmit = async (e, eventName) => {
    e.preventDefault();

    const validation = validateRegistration(formData);

    if (validation.errors.length) {
      setValidationErrors(validation.errors);

      setFieldErrors(validation.fields);

      setShowValidation(true);

      return;
    }

    try {
      setLoading(true);

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
      const message = error.response?.data?.message;

      setValidationErrors(
        Array.isArray(message)
          ? message
          : [message || "Registration failed. Please try again."],
      );

      setShowValidation(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,

    setFormData,

    loading,

    fieldErrors,

    validationErrors,

    showValidation,

    setShowValidation,

    handleChange,

    handleSubmit,
  };
}
