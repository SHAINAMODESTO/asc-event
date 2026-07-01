import { FaUtensils } from "react-icons/fa";

const MealSelection = ({ menuOptions = [], selectedMenu, onSelect }) => {
  if (!menuOptions.length) return null;

  return (
    <div>
      <h3 className="mb-5 flex items-center gap-2 text-xl font-bold">
        <FaUtensils className="text-blue-600" />
        Meal Preference
      </h3>

      <div className="grid gap-4">
        {menuOptions.map((menu) => (
          <button
            key={menu}
            type="button"
            onClick={() => onSelect(menu)}
            className={`rounded-2xl border p-5 text-left transition ${
              selectedMenu === menu
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
            }`}
          >
            <h4 className="font-semibold">{menu}</h4>

            <p className="mt-1 text-sm text-slate-500">
              Select this meal option for your registration.
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MealSelection;
