import { FaExclamationTriangle } from "react-icons/fa";

const ValidationModal = ({ open, errors, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b p-6">
          <div className="rounded-full bg-red-100 p-3">
            <FaExclamationTriangle className="text-red-600" />
          </div>

          <div>
            <h2 className="font-bold text-lg">Registration Error</h2>

            <p className="text-sm text-slate-500">
              Your registration could not be processed.
            </p>
          </div>
        </div>

        <div className="max-h-72 overflow-auto p-6">
          <ul className="space-y-3">
            {errors.map((error, index) => (
              <li key={index} className="rounded-lg bg-red-50 p-3 text-sm">
                • {error}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end border-t p-5">
          <button
            onClick={onClose}
            className="rounded-xl bg-red-600 px-6 py-3 text-white"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationModal;
