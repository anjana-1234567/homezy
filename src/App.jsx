
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import FindServices from "./pages/customer/FindServices";
import MyBookings from "./pages/customer/MyBookings";
import ReviewBooking from "./pages/customer/ReviewBooking";
import Complaints from "./pages/customer/Complaints";
import Profile from "./pages/customer/Profile";
import TrackProvider from "./pages/customer/TrackProvider";
import ContactSupport from "./pages/customer/ContactSupport";
import CustomerLayout from "./pages/customer/CustomerLayout";

// Provider pages
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderServices from "./pages/provider/ProviderServices";
import ProviderRequests from "./pages/provider/ProviderRequests";
import ProviderJobs from "./pages/provider/ProviderJobs";
import ProviderEarnings from "./pages/provider/ProviderEarnings";
import ProviderProfile from "./pages/provider/ProviderProfile";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminProfile from "./pages/admin/AdminProfile";

function NotFound() {
  return (
    <main className="not-found-page">
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>The page you are looking for doesn't exist.</p>

      <button onClick={() => (window.location.href = "/login")}>
        Back to login
      </button>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Customer layout: one shared sidebar */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="find-services" element={<FindServices />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="track-provider" element={<TrackProvider />} />
          <Route path="review" element={<ReviewBooking />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="profile" element={<Profile />} />
          <Route path="support" element={<ContactSupport />} />
        </Route>

        {/* Provider */}
        <Route
          path="/provider"
          element={<ProviderDashboard />}
        />
        <Route
          path="/provider/services"
          element={<ProviderServices />}
        />
        <Route
          path="/provider/requests"
          element={<ProviderRequests />}
        />
        <Route
          path="/provider/jobs"
          element={<ProviderJobs />}
        />
        <Route
          path="/provider/earnings"
          element={<ProviderEarnings />}
        />
        <Route
          path="/provider/profile"
          element={<ProviderProfile />}
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
        <Route
          path="/admin/analytics"
          element={<AdminAnalytics />}
        />
        <Route
          path="/admin/profile"
          element={<AdminProfile />}
        />

        {/* Unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
