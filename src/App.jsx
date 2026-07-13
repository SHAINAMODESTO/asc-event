import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./shared/Sidebar";
import Registration from "./components/Registration";
import RegisterV3 from "./pages/RegisterV3";
import ThankYou from "./components/ThankYou";
import AttendeesList from "./components/AttendeesList";
import EventAttendees from "./components/EventAttendees";
import CreateForm from "./components/CreateForm";
import PublishedEvents from "./components/PublishedEvents";
import AllEventsList from "./components/AllEventsList";
import NotFound from "./pages/NotFound";
import EventSummary from "./components/register/EventSummary";
import Login from "./components/Login";
import UserAdminTable from "./components/UserAdminTable";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/registration" element={<Registration />} />
      <Route path="/registration/:eventId" element={<RegisterV3 />} />
      <Route path="/thankyou" element={<ThankYou />} />
      <Route path="/not-found" element={<NotFound />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Sidebar />
          </ProtectedRoute>
        }
      ></Route>
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

      {/* CREATE / EDIT EVENT */}
      <Route path="/create-event" element={<CreateForm />} />
      <Route path="/create-event/:id" element={<CreateForm />} />

    </Routes>
  );
}

export default App;
