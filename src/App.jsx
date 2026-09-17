import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./shared/Sidebar";
import Registration from "./components/Registration";
import RegisterV3 from "./pages/RegisterV3";
import ThankYou from "./components/ThankYou";
import AttendeesList from "./components/AttendeesList";
import EventAttendees from "./components/EventAttendees";
import CreateForm from "./components/CreateForm";
import PublishedEvents from "./components/PublishedEvents";
import ArchivedEvents from "./components/ArchivedEvents";
import AllEventsList from "./components/AllEventsList";
import NotFound from "./pages/NotFound";
import EventSummary from "./components/register/EventSummary";
import Login from "./components/Login";
import UserAdminTable from "./components/UserAdminTable";
import DeactivatedUsers from "./components/DeactivatedUsers";
import QRScanner from "./qr-scanner/QRScanner";
import EventReports from "./components/EventReports";
import { isAdmin } from "./services/authService";

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

// ========================================
// ADMIN ROUTE
// ========================================
// FE-011: User Management is admin-only — coordinators should never land
// on this page, even by typing/bookmarking the URL directly, so this
// checks role on top of ProtectedRoute's token check and bounces
// non-admins back to the dashboard instead of rendering the page.

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/published-events" replace />;
  }

  return children;
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

        <Route
          path="archived-events"
          element={
            <AdminRoute>
              <ArchivedEvents />
            </AdminRoute>
          }
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
        {/* FE-011: admin-only — coordinators are redirected away. */}

        <Route
          path="useradmin-table"
          element={
            <AdminRoute>
              <UserAdminTable />
            </AdminRoute>
          }
        />

        <Route
          path="deactivated-users"
          element={
            <AdminRoute>
              <DeactivatedUsers />
            </AdminRoute>
          }
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