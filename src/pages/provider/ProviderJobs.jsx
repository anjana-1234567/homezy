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
  CheckCircle,
  Clock,
  MapPin,
  CalendarDays,
  IndianRupee,
  Navigation,
  XCircle,
  LoaderCircle,
  Phone,
} from "lucide-react";

import "./Provider.css";

function ProviderJobs() {
  const navigate = useNavigate();

  // ========================================
  // GET LOGGED-IN PROVIDER
  // ========================================

  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const providerName = user?.name || "Provider";
  const providerId = user?.id;

  // ========================================
  // STATE
  // ========================================

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  // ========================================
  // FETCH REAL JOBS
  // ========================================

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    if (!providerId) {
      setError("Provider login information not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/bookings/provider/${providerId}/jobs`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch provider jobs"
        );
      }

      setJobs(data.jobs || []);
    } catch (err) {
      console.error(
        "Fetch provider jobs error:",
        err
      );

      setError(
        err.message ||
          "Unable to load your jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // MARK JOB COMPLETED
  // ========================================

  const handleComplete = async (bookingId) => {
    const confirmComplete = window.confirm(
      "Are you sure you want to mark this job as completed?"
    );

    if (!confirmComplete) return;

    try {
      setActionLoading(bookingId);

      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "COMPLETED",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to complete the job"
        );
      }

      await fetchJobs();
    } catch (err) {
      console.error(
        "Complete job error:",
        err
      );

      alert(
        err.message ||
          "Something went wrong while completing the job."
      );
    } finally {
      setActionLoading("");
    }
  };

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ========================================
  // HELPERS
  // ========================================

  const getCustomerName = (job) => {
    return (
      job.customerId?.name ||
      "Customer"
    );
  };

  const getCustomerPhone = (job) => {
    return job.customerId?.phone || "";
  };

  const getCustomerInitial = (job) => {
    return (
      getCustomerName(job)
        .charAt(0)
        .toUpperCase() || "C"
    );
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ========================================
  // COUNTS
  // ========================================

  const activeJobs = jobs.filter(
    (job) => job.status === "ACCEPTED"
  ).length;

  const completedJobs = jobs.filter(
    (job) => job.status === "COMPLETED"
  ).length;

  return (
    <div className="provider-layout">
      {/* ====================================
          SIDEBAR
      ==================================== */}

      <aside className="provider-sidebar">
        <div className="provider-logo">
          <Home size={26} />
          <span>Homezy</span>
        </div>

        <nav className="provider-menu">
          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate("/provider")
            }
          >
            <Home size={20} />
            Dashboard
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate("/provider/services")
            }
          >
            <Wrench size={20} />
            My Services
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate("/provider/requests")
            }
          >
            <ClipboardList size={20} />
            Booking Requests
          </button>

          <button
            type="button"
            className="provider-menu-item active"
            onClick={() =>
              navigate("/provider/jobs")
            }
          >
            <Briefcase size={20} />
            My Jobs
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate("/provider/earnings")
            }
          >
            <Wallet size={20} />
            Earnings
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate("/provider/profile")
            }
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

      {/* ====================================
          MAIN CONTENT
      ==================================== */}

      <main className="provider-main">
        {/* HEADER */}

        <header className="provider-header">
          <div>
            <h1>My Jobs</h1>

            <p>
              Manage your accepted and completed
              service jobs.
            </p>
          </div>

          <div className="provider-header-actions">
            <button
              type="button"
              className="provider-profile-circle"
              onClick={() =>
                navigate("/provider/profile")
              }
            >
              {providerName
                .charAt(0)
                .toUpperCase()}
            </button>
          </div>
        </header>

        {/* ====================================
            JOB SUMMARY
        ==================================== */}

        <div className="provider-request-summary">
          <div className="provider-summary-box">
            <span>Active Jobs</span>

            <strong>{activeJobs}</strong>
          </div>

          <div className="provider-summary-box">
            <span>Completed Jobs</span>

            <strong>
              {completedJobs}
            </strong>
          </div>

          <div className="provider-summary-box">
            <span>Total Jobs</span>

            <strong>{jobs.length}</strong>
          </div>
        </div>

        {/* ====================================
            JOB LIST
        ==================================== */}

        <section className="provider-section">
          <div className="provider-section-heading">
            <div>
              <h2>Your Jobs</h2>

              <p>
                Accepted and completed bookings
              </p>
            </div>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="provider-empty-state">
              <LoaderCircle
                size={36}
                className="loading-spinner"
              />

              <h3>
                Loading your jobs...
              </h3>

              <p>
                Please wait while we fetch
                your jobs.
              </p>
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="provider-empty-state">
              <XCircle size={40} />

              <h3>
                Unable to load jobs
              </h3>

              <p>{error}</p>

              <button
                type="button"
                className="provider-accept-button"
                onClick={fetchJobs}
              >
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            jobs.length === 0 && (
              <div className="provider-empty-state">
                <Briefcase size={45} />

                <h3>No jobs yet</h3>

                <p>
                  Accepted bookings will
                  appear here.
                </p>
              </div>
            )}

          {/* JOBS */}

          {!loading &&
            !error &&
            jobs.length > 0 && (
              <div className="provider-jobs-list">
                {jobs.map((job) => {
                  const customerName =
                    getCustomerName(job);

                  const customerPhone =
                    getCustomerPhone(job);

                  const customerInitial =
                    getCustomerInitial(job);

                  const isActionLoading =
                    actionLoading ===
                    job._id;

                  return (
                    <div
                      className="provider-job-full-card"
                      key={job._id}
                    >
                      {/* JOB ICON */}

                      <div className="provider-job-large-icon">
                        <Briefcase size={23} />
                      </div>

                      {/* CUSTOMER + SERVICE */}

                      <div className="provider-job-main-info">
                        <h3>
                          {job.service}
                        </h3>

                        <p>
                          Customer:{" "}
                          <strong>
                            {customerName}
                          </strong>
                        </p>

                        <span>
                          {job.category ||
                            "Home Service"}
                        </span>

                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: "6px",
                            marginTop:
                              "6px",
                            fontSize:
                              "13px",
                          }}
                        >
                          <span
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius:
                                "50%",
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              background:
                                "#f1f5f9",
                              fontWeight:
                                "700",
                            }}
                          >
                            {customerInitial}
                          </span>

                          {customerPhone && (
                            <span>
                              <Phone
                                size={13}
                                style={{
                                  marginRight:
                                    "4px",
                                  verticalAlign:
                                    "middle",
                                }}
                              />
                              {customerPhone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* DATE / TIME */}

                      <div className="provider-request-detail">
                        <span>
                          Date & Time
                        </span>

                        <strong>
                          <CalendarDays
                            size={14}
                          />

                          {formatDate(
                            job.bookingDate
                          )}
                        </strong>

                        <small>
                          <Clock size={13} />

                          {job.bookingTime}
                        </small>
                      </div>

                      {/* LOCATION */}

                      <div className="provider-request-detail">
                        <span>
                          Customer Location
                        </span>

                        <strong>
                          <MapPin size={14} />

                          {job
                            .customerLocation
                            ?.address ||
                            "Location not available"}
                        </strong>
                      </div>

                      {/* PRICE */}

                      <div className="provider-request-detail">
                        <span>
                          Earnings
                        </span>

                        <strong>
                          <IndianRupee
                            size={14}
                          />

                          {job.price}
                        </strong>
                      </div>

                      {/* STATUS */}

                      <div className="provider-job-status-column">
                        {job.status ===
                          "ACCEPTED" && (
                          <>
                            <span className="provider-job-status accepted">
                              <Clock size={15} />
                              ACCEPTED
                            </span>

                            <button
                              type="button"
                              className="provider-complete-button"
                              disabled={
                                isActionLoading
                              }
                              onClick={() =>
                                handleComplete(
                                  job._id
                                )
                              }
                            >
                              {isActionLoading ? (
                                <LoaderCircle
                                  size={16}
                                  className="loading-spinner"
                                />
                              ) : (
                                <CheckCircle
                                  size={16}
                                />
                              )}

                              {isActionLoading
                                ? "Updating..."
                                : "Mark Completed"}
                            </button>
                          </>
                        )}

                        {job.status ===
                          "COMPLETED" && (
                          <span className="provider-job-status completed">
                            <CheckCircle
                              size={15}
                            />
                            COMPLETED
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </section>

        {/* ====================================
            NOTE
        ==================================== */}

        <div className="provider-info-box">
          <div className="provider-info-icon">
            <Navigation size={20} />
          </div>

          <div>
            <h3>Job Management</h3>

            <p>
              Accepted bookings appear here.
              Mark a job as completed after
              finishing the service.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProviderJobs;