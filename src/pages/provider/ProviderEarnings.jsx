
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Wrench,
  ClipboardList,
  Briefcase,
  Wallet,
  User,
  LogOut,
  IndianRupee,
  CheckCircle,
  Clock,
  LoaderCircle,
  XCircle,
  TrendingUp,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import { API_ENDPOINTS } from "../../config/api";
import "./Provider.css";

function ProviderEarnings() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedJobsCount, setCompletedJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const providerName = user?.name || "Provider";
  const providerId = user?._id || user?.id || user?.userId;

  useEffect(() => {
    fetchEarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const fetchEarnings = async () => {
    if (!providerId) {
      setError("Provider login information not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_ENDPOINTS.BOOKINGS}/provider/${providerId}/earnings`
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to load earnings.");
      }

      const completedJobs = (data.jobs || []).filter(
        (job) => job.status === "COMPLETED"
      );

      setJobs(completedJobs);
      setTotalEarnings(
        Number(
          data.totalEarnings ??
          completedJobs.reduce(
            (total, job) => total + Number(job.price || 0),
            0
          )
        )
      );
      setCompletedJobsCount(
        Number(data.completedJobsCount ?? completedJobs.length)
      );
    } catch (err) {
      console.error("Fetch earnings error:", err);
      setError(err.message || "Unable to load earnings.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatMoney = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  return (
    <div className="provider-layout">
      <aside className="provider-sidebar">
        <div className="provider-logo">
          <Home size={26} />
          <span>Homezy</span>
        </div>

        <nav className="provider-menu">
          <button
            type="button"
            className="provider-menu-item"
            onClick={() => navigate("/provider")}
          >
            <Home size={20} />
            Dashboard
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() => navigate("/provider/services")}
          >
            <Wrench size={20} />
            My Services
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() => navigate("/provider/requests")}
          >
            <ClipboardList size={20} />
            Booking Requests
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() => navigate("/provider/jobs")}
          >
            <Briefcase size={20} />
            My Jobs
          </button>

          <button
            type="button"
            className="provider-menu-item active"
            onClick={() => navigate("/provider/earnings")}
          >
            <Wallet size={20} />
            Earnings
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() => navigate("/provider/profile")}
          >
            <User size={20} />
            My Profile
          </button>
        </nav>

        <div className="provider-sidebar-bottom">
          <button
            type="button"
            className="provider-menu-item logout-item"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="provider-main">
        <header className="provider-header">
          <div>
            <h1>My Earnings</h1>
            <p>Track your income from completed Homezy jobs.</p>
          </div>

          <div className="provider-header-actions">
            <button
              type="button"
              className="provider-profile-circle"
              onClick={() => navigate("/provider/profile")}
              title={providerName}
            >
              {providerName.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        <section className="provider-request-summary">
          <div className="provider-summary-box">
            <span>Total Earnings</span>
            <strong>
              <IndianRupee size={19} />
              {formatMoney(totalEarnings)}
            </strong>
          </div>

          <div className="provider-summary-box">
            <span>Completed Jobs</span>
            <strong>{completedJobsCount}</strong>
          </div>

          <div className="provider-summary-box">
            <span>Average per Job</span>
            <strong>
              <IndianRupee size={19} />
              {formatMoney(
                completedJobsCount > 0
                  ? totalEarnings / completedJobsCount
                  : 0
              )}
            </strong>
          </div>
        </section>

        <section className="provider-section">
          <div className="provider-section-heading">
            <div>
              <h2>
                <TrendingUp size={21} />
                Earnings History
              </h2>
              <p>Your completed bookings and their amounts.</p>
            </div>

            <button
              type="button"
              className="provider-accept-button"
              onClick={fetchEarnings}
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle size={16} className="loading-spinner" />
              ) : (
                <RefreshCw size={16} />
              )}
              Refresh
            </button>
          </div>

          {loading && (
            <div className="provider-empty-state">
              <LoaderCircle size={36} className="loading-spinner" />
              <h3>Loading earnings...</h3>
              <p>Please wait while we fetch your earnings.</p>
            </div>
          )}

          {!loading && error && (
            <div className="provider-empty-state">
              <XCircle size={40} />
              <h3>Unable to load earnings</h3>
              <p>{error}</p>
              <button
                type="button"
                className="provider-accept-button"
                onClick={fetchEarnings}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="provider-empty-state">
              <Wallet size={44} />
              <h3>No earnings yet</h3>
              <p>
                When you complete accepted jobs, they will appear
                here with their earnings.
              </p>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <div className="provider-jobs-list">
              {jobs.map((job) => (
                <div
                  className="provider-job-full-card"
                  key={job._id}
                >
                  <div className="provider-job-large-icon">
                    <Wallet size={23} />
                  </div>

                  <div className="provider-job-main-info">
                    <h3>{job.service || "Home Service"}</h3>
                    <p>
                      Customer:{" "}
                      <strong>
                        {job.customerId?.name || "Customer"}
                      </strong>
                    </p>
                    <span>{job.category || "Home Service"}</span>
                  </div>

                  <div className="provider-request-detail">
                    <span>Completed on</span>
                    <strong>
                      <CalendarDays size={15} />
                      {formatDate(job.updatedAt || job.bookingDate)}
                    </strong>
                    <small>
                      <Clock size={13} />
                      {job.bookingTime || "Time unavailable"}
                    </small>
                  </div>

                  <div className="provider-request-detail">
                    <span>Job Amount</span>
                    <strong>
                      <IndianRupee size={16} />
                      {formatMoney(job.price)}
                    </strong>
                  </div>

                  <div className="provider-job-status-column">
                    <span className="provider-job-status completed">
                      <CheckCircle size={15} />
                      COMPLETED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="provider-info-box">
          <div className="provider-info-icon">
            <Wallet size={20} />
          </div>
          <div>
            <h3>About your earnings</h3>
            <p>
              Earnings are calculated from completed jobs returned
              by your Homezy backend. Actual payouts may differ if
              platform fees or other deductions apply.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProviderEarnings;
