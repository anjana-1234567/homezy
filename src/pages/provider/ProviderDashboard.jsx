import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Wrench, ClipboardList, Briefcase, Wallet, User, LogOut,
  Bell, MapPin, Navigation, CheckCircle, XCircle, Clock, ChevronRight,
} from "lucide-react";
import { getSavedLocation, getCurrentLocation } from "../../utils/location";
import "./Provider.css";

function ProviderDashboard() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const providerId = user?._id || user?.id || user?.userId || null;
  const providerName = user?.name || "Provider";
  const providerInitial = providerName.charAt(0).toUpperCase();

  const [location, setLocation] = useState(getSavedLocation());
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const [newRequests, setNewRequests] = useState(0);
  const [acceptedJobs, setAcceptedJobs] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [todayJobs, setTodayJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isToday = (bookingDate) => {
    if (!bookingDate) return false;
    const value = String(bookingDate).trim().toLowerCase();
    if (value === "today") return true;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) {
      return Number(iso[1]) === year && Number(iso[2]) === month && Number(iso[3]) === day;
    }

    const slash = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
      return Number(slash[3]) === year && Number(slash[2]) === month && Number(slash[1]) === day;
    }

    const dash = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dash) {
      return Number(dash[3]) === year && Number(dash[2]) === month && Number(dash[1]) === day;
    }

    const parsed = new Date(bookingDate);
    return !Number.isNaN(parsed.getTime()) &&
      parsed.getFullYear() === year &&
      parsed.getMonth() + 1 === month &&
      parsed.getDate() === day;
  };

  const loadDashboardData = async () => {
    if (!providerId) {
      setLoading(false);
      setError("Provider details not found. Please login again.");
      return;
    }

    try {
      setError("");

      const requestsResponse = await fetch(
        `http://localhost:5000/api/bookings/provider/${providerId}/requests`
      );
      if (!requestsResponse.ok) throw new Error("Failed to load booking requests");
      const requestsData = await requestsResponse.json();
      const requests = Array.isArray(requestsData.requests) ? requestsData.requests : [];
      const pendingRequests = requests.filter((booking) => booking.status === "REQUESTED");

      setBookingRequests(pendingRequests.slice(0, 3));
      setNewRequests(Number(requestsData.counts?.newRequests ?? pendingRequests.length ?? 0));
      setAcceptedJobs(Number(requestsData.counts?.accepted ?? 0));

      const jobsResponse = await fetch(
        `http://localhost:5000/api/bookings/provider/${providerId}/jobs`
      );
      if (!jobsResponse.ok) throw new Error("Failed to load provider jobs");
      const jobsData = await jobsResponse.json();
      const jobs = Array.isArray(jobsData.jobs) ? jobsData.jobs : [];

      const todaysJobs = jobs.filter((job) =>
        isToday(job.bookingDate) &&
        (job.status === "ACCEPTED" || job.status === "COMPLETED")
      );
      setTodayJobs(todaysJobs.slice(0, 5));

      const earningsResponse = await fetch(
        `http://localhost:5000/api/bookings/provider/${providerId}/earnings`
      );
      if (!earningsResponse.ok) throw new Error("Failed to load earnings");
      const earningsData = await earningsResponse.json();
      setTotalEarnings(Number(earningsData.totalEarnings ?? 0));
      setCompletedJobs(Number(earningsData.completedJobsCount ?? 0));

      // Rating stays unavailable until the backend reviews endpoint is connected.
      // Fetch provider's average rating
try {
  const reviewsResponse = await fetch(
    `http://localhost:5000/api/reviews/provider/${providerId}`
  );

  if (!reviewsResponse.ok) {
    throw new Error("Failed to load provider reviews");
  }

  const reviewsData = await reviewsResponse.json();

  setAverageRating(
    reviewsData.success
      ? Number(reviewsData.averageRating) || 0
      : 0
  );
} catch (reviewError) {
  console.error("Rating fetch error:", reviewError);
  setAverageRating(0);
}
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to load dashboard data.");
      setNewRequests(0);
      setAcceptedJobs(0);
      setCompletedJobs(0);
      setTotalEarnings(0);
      setBookingRequests([]);
      setTodayJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  useEffect(() => {
    const savedLocation = getSavedLocation();
    if (savedLocation) setLocation(savedLocation);
  }, []);

  const handleCurrentLocation = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setLocationLoading(true);
      setLocationMessage("Detecting your current location...");
      const locationData = await getCurrentLocation(providerId);
      setLocation(locationData);
      setLocationMessage("Current location saved successfully.");
    } catch (err) {
      console.error("Location error:", err);
      setLocationMessage(err.message || "Unable to get your current location.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="provider-layout">
        <aside className="provider-sidebar">
          <div className="provider-logo"><Home size={26} /><span>Homezy</span></div>
        </aside>
        <main className="provider-main">
          <div style={{ padding: "40px", fontSize: "18px", fontWeight: "600" }}>
            Loading your dashboard...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="provider-layout">
      <aside className="provider-sidebar">
        <div className="provider-logo"><Home size={26} /><span>Homezy</span></div>
        <nav className="provider-menu">
          <button type="button" className="provider-menu-item active" onClick={() => navigate("/provider")}><Home size={20} />Dashboard</button>
          <button type="button" className="provider-menu-item" onClick={() => navigate("/provider/services")}><Wrench size={20} />My Services</button>
          <button type="button" className="provider-menu-item" onClick={() => navigate("/provider/requests")}><ClipboardList size={20} />Booking Requests</button>
          <button type="button" className="provider-menu-item" onClick={() => navigate("/provider/jobs")}><Briefcase size={20} />My Jobs</button>
          <button type="button" className="provider-menu-item" onClick={() => navigate("/provider/earnings")}><Wallet size={20} />Earnings</button>
          <button type="button" className="provider-menu-item" onClick={() => navigate("/provider/profile")}><User size={20} />My Profile</button>
        </nav>
        <div className="provider-sidebar-bottom">
          <button type="button" className="provider-menu-item logout-item" onClick={handleLogout}><LogOut size={20} />Logout</button>
        </div>
      </aside>

      <main className="provider-main">
        <header className="provider-header">
          <div>
            <h1>Good Morning, {providerName} 👋</h1>
            <p>Manage your services and bookings from here.</p>
          </div>
          <div className="provider-header-actions">
            <button type="button" className="provider-notification" onClick={() => navigate("/provider/requests")}>
              <Bell size={21} />
              {newRequests > 0 && <span>{newRequests}</span>}
            </button>
            <button type="button" className="provider-profile-circle" onClick={() => navigate("/provider/profile")}>{providerInitial}</button>
          </div>
        </header>

        {error && (
          <div style={{ marginBottom: "20px", padding: "14px 18px", borderRadius: "10px", background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3" }}>
            {error}
          </div>
        )}

        <div className="provider-location-bar">
          <MapPin size={20} />
          <div>
            <span>Your Location</span>
            <strong>{location?.address || "Location not set"}</strong>
            {locationMessage && <small>{locationMessage}</small>}
          </div>
          <button type="button" onClick={handleCurrentLocation} disabled={locationLoading}>
            <Navigation size={16} />{locationLoading ? "Detecting..." : "Change"}
          </button>
        </div>

        <section className="provider-section">
          <div className="provider-section-heading">
            <div><h2>Today's Overview</h2><p>Keep track of your service activity</p></div>
          </div>
          <div className="provider-stats-grid">
            <div className="provider-stat-card">
              <div className="provider-stat-icon"><span style={{ fontSize: "25px" }}>⭐</span></div>
              <div><span>Average Rating</span><strong>{Number(averageRating) > 0 ? `${Number(averageRating).toFixed(1)} / 5` : "—"}</strong></div>
            </div>
            <div className="provider-stat-card">
              <div className="provider-stat-icon"><ClipboardList size={23} /></div>
              <div><span>New Requests</span><strong>{newRequests}</strong></div>
            </div>
            <div className="provider-stat-card">
              <div className="provider-stat-icon"><Clock size={23} /></div>
              <div><span>Accepted Jobs</span><strong>{acceptedJobs}</strong></div>
            </div>
            <div className="provider-stat-card">
              <div className="provider-stat-icon"><CheckCircle size={23} /></div>
              <div><span>Completed Jobs</span><strong>{completedJobs}</strong></div>
            </div>
            <div className="provider-stat-card">
              <div className="provider-stat-icon"><Wallet size={23} /></div>
              <div><span>Total Earnings</span><strong>₹{totalEarnings.toLocaleString("en-IN")}</strong></div>
            </div>
          </div>
        </section>

        <section className="provider-section">
          <div className="provider-section-heading">
            <div><h2>Booking Requests</h2><p>Recent customers requesting your services</p></div>
            <button type="button" className="provider-view-all" onClick={() => navigate("/provider/requests")}>View All <ChevronRight size={17} /></button>
          </div>

          {bookingRequests.length === 0 ? (
            <div className="provider-request-card">
              <div className="provider-request-info">
                <div className="provider-request-avatar">✓</div>
                <div><h3>No new booking requests</h3><p>New customer requests will appear here.</p></div>
              </div>
            </div>
          ) : bookingRequests.map((booking) => {
            const customerName = booking.customerId?.name || "Customer";
            return (
              <div className="provider-request-card" key={booking._id}>
                <div className="provider-request-info">
                  <div className="provider-request-avatar">{customerName.charAt(0).toUpperCase()}</div>
                  <div>
                    <h3>{customerName}</h3>
                    <p>{booking.service} {" • "} {booking.bookingDate} {" • "} {booking.bookingTime}</p>
                    <span>₹{Number(booking.price || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="provider-request-actions">
                  <button type="button" className="provider-accept-button" onClick={() => navigate("/provider/requests")}><CheckCircle size={16} />Accept</button>
                  <button type="button" className="provider-reject-button" onClick={() => navigate("/provider/requests")}><XCircle size={16} />Reject</button>
                </div>
              </div>
            );
          })}
        </section>

        <section className="provider-section">
          <div className="provider-section-heading">
            <div><h2>Today's Jobs</h2><p>Jobs scheduled for today</p></div>
            <button type="button" className="provider-view-all" onClick={() => navigate("/provider/jobs")}>View All <ChevronRight size={17} /></button>
          </div>

          {todayJobs.length === 0 ? (
            <div className="provider-job-card">
              <div className="provider-job-icon"><Wrench size={25} /></div>
              <div className="provider-job-info"><h3>No jobs scheduled for today</h3><p>Accepted jobs scheduled for today will appear here.</p></div>
            </div>
          ) : todayJobs.map((job) => (
            <div className="provider-job-card" key={job._id}>
              <div className="provider-job-icon"><Wrench size={25} /></div>
              <div className="provider-job-info">
                <h3>{job.service}</h3>
                <p>Customer: {job.customerId?.name || "Customer"}</p>
                <span>{job.bookingDate} {" • "} {job.bookingTime} {" • ₹"}{Number(job.price || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="provider-job-status">{job.status}</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default ProviderDashboard;
