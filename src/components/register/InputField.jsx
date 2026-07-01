import React from "react";

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  icon: Icon,
  error = false,
  maxLength,
}) => {
  const inputClass = `
    w-full rounded-xl border py-3 transition duration-200
    focus:outline-none focus:ring-4
    ${Icon ? "pl-11 pr-4" : "px-4"}
    ${
      error
        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100"
        : "border-slate-300 bg-white hover:border-slate-400 focus:border-blue-600 focus:ring-blue-100"
    }
  `;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${
              error ? "text-red-500" : "text-slate-400"
            }`}
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          placeholder={placeholder}
          className={inputClass}
        />
      </div>
    </div>
  );
};

export default InputField;
