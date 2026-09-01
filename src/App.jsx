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
import QRScanner from "./qr-scanner/QRScanner";
import EventReports from "./components/EventReports";

// ========================================
// PROTECTED ROUTE
// ========================================

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");

  return token ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <Routes>

      {/* ========================================
          PUBLIC PAGES
      ======================================== */}

      <Route
        path="/registration"
        element={<Registration />}
      />

      <Route
        path="/registration/:eventId"
        element={<RegisterV3 />}
      />

      <Route
        path="/thankyou"
        element={<ThankYou />}
      />

      <Route
        path="/not-found"
        element={<NotFound />}
      />

      {/* ========================================
          LOGIN
      ======================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* ========================================
          PROTECTED DASHBOARD
      ======================================== */}

      <Route
        element={
          <ProtectedRoute>
            <Sidebar />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}

        <Route
          index
          element={<Navigate to="/published-events" replace />}
        />

        {/* Events */}

        <Route
          path="create-event"
          element={<CreateForm />}
        />

        <Route
          path="create-event/:id"
          element={<CreateForm />}
        />

        <Route
          path="draft-events"
          element={<AllEventsList />}
        />

        <Route
          path="published-events"
          element={<PublishedEvents />}
        />

        {/* Attendees */}

        <Route
          path="attendees"
          element={<AttendeesList />}
        />

        <Route
          path="attendees/:eventId"
          element={<EventAttendees />}
        />

        {/* QR Scanner */}

        <Route
          path="attendees/:eventId/scanner"
          element={<QRScanner />}
        />

        {/* User Administration */}

        <Route
          path="useradmin-table"
          element={<UserAdminTable />}
        />

        {/* Reports */}

        <Route
          path="event-reports/:eventId"
          element={<EventReports />}
        />

        {/* Event Summary */}

        <Route
          path="event-summary"
          element={<EventSummary />}
        />

      </Route>

      {/* ========================================
          404
      ======================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}

export default App;

