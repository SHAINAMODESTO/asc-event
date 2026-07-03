import { Routes, Route } from "react-router-dom";
import Sidebar from "./shared/Sidebar";
import Registration from "./components/Registration";
import RegisterV3 from "./pages/RegisterV3";
import ThankYou from "./components/ThankYou";
import AttendeesList from "./components/AttendeesList";
import EventAttendees from "./components/EventAttendees";
import CreateForm from "./components/CreateForm";
import PublishedEvents from "./components/PublishedEvents";
import AllEventsList from "./components/AllEventsList";

function App() {
  return (
    <Routes>
      {/* Sidebar Layout */}
      <Route path="/" element={<Sidebar />}>
        <Route path="create-event" element={<CreateForm />} />
        <Route path="draft-events" element={<AllEventsList />} />
        <Route path="attendees" element={<AttendeesList />} />
        <Route path="attendees/:eventId" element={<EventAttendees />} />
        <Route path="published-events" element={<PublishedEvents />} />
      </Route>

      {/* Public Pages */}
      <Route path="/registration" element={<Registration />} />
      <Route path="/registration/:eventId" element={<RegisterV3 />} />
      <Route path="/thankyou" element={<ThankYou />} />
    </Routes>
  );
}

export default App;