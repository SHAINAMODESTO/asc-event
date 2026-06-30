import { Routes, Route } from "react-router-dom";
import Sidebar from "./shared/Sidebar";
import Registration from "./components/Registration";
import ThankYou from "./components/ThankYou";
import AttendeesList from "./components/AttendeesList";
import EventAttendees from "./components/EventAttendees";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Sidebar />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/thankyou" element={<ThankYou />} />

      {/* Attendees */}
        <Route path="/attendees" element={<AttendeesList />} />
        <Route path="/attendees/:eventId" element={<EventAttendees />} />
    </Routes>
  );
}

export default App;