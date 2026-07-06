import { Routes, Route } from "react-router-dom";
import Sidebar from "./shared/Sidebar";
import Registration from "./components/Registration";
import RegisterV3 from "./pages/RegisterV3";
import ThankYou from "./components/ThankYou";
import AttendeesList from "./components/AttendeesList";
import EventAttendees from "./components/EventAttendees";
import CreateForm from "./components/CreateForm";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Sidebar />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/registration/:eventId" element={<RegisterV3 />} />
      <Route path="/thankyou" element={<ThankYou />} />
      {/* Catch all unknown routes */}
      <Route path="*" element={<NotFound />} />
      {/* CREATE / EDIT EVENT */}
      <Route path="/create-event" element={<CreateForm />} />
      <Route path="/create-event/:id" element={<CreateForm />} />

      {/* Attendees */}
      <Route path="/attendees" element={<AttendeesList />} />
      <Route path="/attendees/:eventId" element={<EventAttendees />} />
    </Routes>
  );
}

export default App;
