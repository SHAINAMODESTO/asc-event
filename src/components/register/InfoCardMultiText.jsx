import React from "react";

const InfoCardMultiText = ({ icon: Icon, title, items }) => {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-red-200 hover:shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
        <Icon className="text-xl text-red-600" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900">{title}</h3>

        <div className="mt-1 grid grid-cols-[110px_1fr] gap-y-1 text-sm">
          {items.map((item) => (
            <React.Fragment key={item.label}>
              <span className="font-medium text-slate-700">{item.label}</span>

              <span className="text-slate-600 break-words">{item.value}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoCardMultiText;
