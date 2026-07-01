const SectionHeader = ({ eyebrow, title, description }) => {
  return (
    <div>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-2 text-3xl font-bold text-slate-900">{title}</h2>

      {description && <p className="mt-2 text-slate-500">{description}</p>}
    </div>
  );
};

export default SectionHeader;
