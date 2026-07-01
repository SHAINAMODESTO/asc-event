import { FaExclamationTriangle } from "react-icons/fa";

export default function ValidationModal({ open, errors, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-200 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <FaExclamationTriangle className="text-xl text-red-600" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Please complete the required fields
            </h2>

            <p className="text-sm text-slate-500">
              The following fields are required before you can continue.
            </p>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-6">
          <ul className="space-y-3">
            {errors.map((error, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-lg bg-red-50 p-3"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />

                <span className="text-sm text-slate-700">{error}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end border-t border-slate-200 p-5">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
