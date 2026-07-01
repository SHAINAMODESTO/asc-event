export const validateRegistration = (formData) => {
  const errors = [];
  const fields = {};

  const requiredFields = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "preferredName", label: "Preferred Name on Badge" },
    { key: "email", label: "Email Address" },
    { key: "contactNumber", label: "Contact Number" },
    { key: "companyName", label: "Company / Organization" },
    { key: "position", label: "Position" },
  ];

  requiredFields.forEach(({ key, label }) => {
    const value = formData[key];

    if (!value || value.toString().trim() === "") {
      errors.push(`${label} is required.`);
      fields[key] = true;
    }
  });

  return {
    errors,
    fields,
  };
};
