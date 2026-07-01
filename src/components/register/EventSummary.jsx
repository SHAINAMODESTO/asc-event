import { FaCalendarAlt, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

const cards = [
  {
    title: "Venue",
    icon: FaMapMarkerAlt,
    key: "venue",
  },
  {
    title: "Schedule",
    icon: FaCalendarAlt,
    key: "schedule",
  },
  {
    title: "Contact",
    icon: FaPhoneAlt,
    key: "contact",
  },
];

const EventSummary = ({ venue, schedule, contact }) => {
  const values = {
    venue,
    schedule,
    contact,
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div key={card.key} className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3">
                <Icon className="text-blue-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">{card.title}</p>

                <h3 className="mt-1 font-semibold">{values[card.key]}</h3>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventSummary;
