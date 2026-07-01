const PrivacyAgreement = ({ checked, onChange }) => {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="mt-1 h-5 w-5 rounded"
        />

        <span className="text-sm leading-7 text-slate-700">
          I certify that the information I have provided is true and correct. I
          also consent to the collection and processing of my personal
          information in accordance with the Data Privacy Act of 2012.
        </span>
      </label>
    </div>
  );
};

export default PrivacyAgreement;
