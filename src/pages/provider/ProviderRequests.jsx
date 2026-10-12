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
  XCircle,
  Clock,
  CalendarDays,
  IndianRupee,
  LoaderCircle,
  Phone,
} from "lucide-react";

import "./Provider.css";

function ProviderRequests() {
  const navigate = useNavigate();

  // ======================================================
  // LOGGED-IN PROVIDER
  // ======================================================

  const storedUser =
    localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const providerName =
    user?.name || "Provider";

  const providerId =
    user?._id ||
    user?.id ||
    user?.userId;

  // ======================================================
  // STATE
  // ======================================================

  const [requests, setRequests] =
    useState([]);

  const [counts, setCounts] =
    useState({
      newRequests: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
    });

  const [activeTab, setActiveTab] =
    useState("PENDING");

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState("");

  const [error, setError] =
    useState("");

  // ======================================================
  // FETCH REQUEST HISTORY
  // ======================================================

 useEffect(() => {
  fetchRequests();

  const intervalId = window.setInterval(() => {
    fetchRequests(true);
  }, 5000);

  return () => window.clearInterval(intervalId);
}, []);
 const fetchRequests = async (silent = false) => {
  if (!providerId) {
    setError("Provider login information not found.");
    setLoading(false);
    return;
  }

  try {
    if (!silent) setLoading(true);
    setError("");

    const response = await fetch(
      `http://localhost:5000/api/bookings/provider/${providerId}/requests`
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to fetch booking requests"
      );
    }

    setRequests(data.requests || []);

    setCounts(
      data.counts || {
        newRequests: 0,
        accepted: 0,
        rejected: 0,
        completed: 0,
      }
    );
  } catch (err) {
    console.error("Fetch provider requests error:", err);

    if (!silent) {
      setError(err.message || "Unable to load booking requests.");
    }
  } finally {
    if (!silent) setLoading(false);
  }
};
  // ======================================================
  // UPDATE BOOKING STATUS
  // ======================================================

  const updateBookingStatus = async (
    bookingId,
    status
  ) => {
    try {
      setActionLoading(
        bookingId
      );

      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            `Unable to ${status.toLowerCase()} booking`
        );
      }

      // Refresh data immediately
      await fetchRequests();

      // Move to correct tab
      if (status === "ACCEPTED") {
        setActiveTab("ACCEPTED");
      }

      if (status === "REJECTED") {
        setActiveTab("REJECTED");
      }

      if (status === "COMPLETED") {
        setActiveTab("ACCEPTED");
      }
    } catch (err) {
      console.error(
        "Update booking status error:",
        err
      );

      alert(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setActionLoading("");
    }
  };

  // ======================================================
  // ACCEPT
  // ======================================================

  const handleAccept = async (
    bookingId
  ) => {
    await updateBookingStatus(
      bookingId,
      "ACCEPTED"
    );
  };

  // ======================================================
  // REJECT
  // ======================================================

  const handleReject = async (
    bookingId
  ) => {
    const confirmReject =
      window.confirm(
        "Are you sure you want to reject this booking request?"
      );

    if (!confirmReject) {
      return;
    }

    await updateBookingStatus(
      bookingId,
      "REJECTED"
    );
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login");
  };

  // ======================================================
  // HELPERS
  // ======================================================

  const getCustomerName = (
    booking
  ) => {
    return (
      booking.customerId?.name ||
      "Customer"
    );
  };

  const getCustomerPhone = (
    booking
  ) => {
    return (
      booking.customerId?.phone ||
      ""
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
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

  // ======================================================
  // FILTER
  //
  // PENDING:
  // REQUESTED only
  //
  // ACCEPTED:
  // ACCEPTED + COMPLETED
  //
  // REJECTED:
  // REJECTED only
  // ======================================================

  const filteredRequests =
    requests.filter(
      (request) => {
        if (
          activeTab === "PENDING"
        ) {
          return (
            request.status ===
            "REQUESTED"
          );
        }

        if (
          activeTab === "ACCEPTED"
        ) {
          return (
            request.status ===
              "ACCEPTED" ||
            request.status ===
              "COMPLETED"
          );
        }

        if (
          activeTab === "REJECTED"
        ) {
          return (
            request.status ===
            "REJECTED"
          );
        }

        return false;
      }
    );

  // ======================================================
  // COUNTS
  // ======================================================

  const newRequests =
    counts.newRequests || 0;

  const acceptedRequests =
    counts.accepted || 0;

  const rejectedRequests =
    counts.rejected || 0;

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="provider-layout">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="provider-sidebar">

        <div className="provider-logo">
          <Home size={26} />

          <span>
            Homezy
          </span>
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
              navigate(
                "/provider/services"
              )
            }
          >
            <Wrench size={20} />
            My Services
          </button>

          <button
            type="button"
            className="provider-menu-item active"
            onClick={() =>
              navigate(
                "/provider/requests"
              )
            }
          >
            <ClipboardList
              size={20}
            />
            Booking Requests
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate(
                "/provider/jobs"
              )
            }
          >
            <Briefcase size={20} />
            My Jobs
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate(
                "/provider/earnings"
              )
            }
          >
            <Wallet size={20} />
            Earnings
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate(
                "/provider/profile"
              )
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

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="provider-main">

        {/* HEADER */}

        <header className="provider-header">

          <div>

            <h1>
              Booking Requests
            </h1>

            <p>
              Manage customer requests
              and view your booking history.
            </p>

          </div>

          <div className="provider-header-actions">

            <button
              type="button"
              className="provider-profile-circle"
              onClick={() =>
                navigate(
                  "/provider/profile"
                )
              }
            >
              {providerName
                .charAt(0)
                .toUpperCase()}
            </button>

          </div>

        </header>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div className="provider-request-summary">

          <div className="provider-summary-box">

            <span>
              New Requests
            </span>

            <strong>
              {newRequests}
            </strong>

          </div>

          <div className="provider-summary-box">

            <span>
              Accepted
            </span>

            <strong>
              {acceptedRequests}
            </strong>

          </div>

          <div className="provider-summary-box">

            <span>
              Rejected
            </span>

            <strong>
              {rejectedRequests}
            </strong>

          </div>

        </div>

        {/* ==================================================
            SECTION
        ================================================== */}

        <section className="provider-section">

          <div className="provider-section-heading">

            <div>

              <h2>
                Booking History
              </h2>

              <p>
                Pending requests and
                previous decisions
              </p>

            </div>

          </div>

          {/* ==================================================
              TABS
          ================================================== */}

          <div className="booking-history-tabs">

            {/* PENDING */}

            <button
              type="button"
              className={
                activeTab ===
                "PENDING"
                  ? "booking-tab active"
                  : "booking-tab"
              }
              onClick={() =>
                setActiveTab(
                  "PENDING"
                )
              }
            >

              <Clock size={17} />

              Pending

              <span>
                {newRequests}
              </span>

            </button>

            {/* ACCEPTED */}

            <button
              type="button"
              className={
                activeTab ===
                "ACCEPTED"
                  ? "booking-tab active"
                  : "booking-tab"
              }
              onClick={() =>
                setActiveTab(
                  "ACCEPTED"
                )
              }
            >

              <CheckCircle
                size={17}
              />

              Accepted

              <span>
                {acceptedRequests}
              </span>

            </button>

            {/* REJECTED */}

            <button
              type="button"
              className={
                activeTab ===
                "REJECTED"
                  ? "booking-tab active"
                  : "booking-tab"
              }
              onClick={() =>
                setActiveTab(
                  "REJECTED"
                )
              }
            >

              <XCircle size={17} />

              Rejected

              <span>
                {rejectedRequests}
              </span>

            </button>

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (

            <div className="provider-empty-state">

              <LoaderCircle
                size={36}
                className="loading-spinner"
              />

              <h3>
                Loading requests...
              </h3>

              <p>
                Please wait while we
                fetch your booking history.
              </p>

            </div>

          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading &&
            error && (

              <div className="provider-empty-state">

                <XCircle size={40} />

                <h3>
                  Unable to load requests
                </h3>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  className="provider-accept-button"
                  onClick={
                    fetchRequests
                  }
                >
                  Try Again
                </button>

              </div>

            )}

          {/* ==================================================
              EMPTY
          ================================================== */}

          {!loading &&
            !error &&
            filteredRequests.length ===
              0 && (

              <div className="provider-empty-state">

                {activeTab ===
                "PENDING" ? (
                  <ClipboardList
                    size={45}
                  />
                ) : activeTab ===
                  "ACCEPTED" ? (
                  <CheckCircle
                    size={45}
                  />
                ) : (
                  <XCircle
                    size={45}
                  />
                )}

                <h3>

                  {activeTab ===
                  "PENDING"
                    ? "No pending requests"
                    : activeTab ===
                      "ACCEPTED"
                    ? "No accepted bookings"
                    : "No rejected bookings"}

                </h3>

                <p>

                  {activeTab ===
                  "PENDING"
                    ? "New customer requests will appear here."
                    : activeTab ===
                      "ACCEPTED"
                    ? "Accepted and completed bookings will appear here."
                    : "Bookings you reject will appear here."}

                </p>

              </div>

            )}

          {/* ==================================================
              TABLE
          ================================================== */}

          {!loading &&
            !error &&
            filteredRequests.length >
              0 && (

              <div className="booking-history-table-wrapper">

                <table className="booking-history-table">

                  <thead>

                    <tr>

                      <th>
                        Customer
                      </th>

                      <th>
                        Service
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Time
                      </th>

                      <th>
                        Amount
                      </th>

                      <th>
                        Contact
                      </th>

                      <th>
                        Status
                      </th>

                      {activeTab ===
                        "PENDING" && (
                        <th>
                          Action
                        </th>
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {filteredRequests.map(
                      (request) => {

                        const customerName =
                          getCustomerName(
                            request
                          );

                        const customerPhone =
                          getCustomerPhone(
                            request
                          );

                        const isActionLoading =
                          actionLoading ===
                          request._id;

                        return (

                          <tr
                            key={
                              request._id
                            }
                          >

                            {/* CUSTOMER */}

                            <td>

                              <div className="booking-customer-cell">

                                <div className="booking-customer-avatar">

                                  {customerName
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}

                                </div>

                                <div>

                                  <strong>
                                    {customerName}
                                  </strong>

                                  <small>
                                    Customer
                                  </small>

                                </div>

                              </div>

                            </td>

                            {/* SERVICE */}

                            <td>

                              <div className="booking-service-cell">

                                <strong>
                                  {
                                    request.service
                                  }
                                </strong>

                                <small>
                                  {request.category ||
                                    "Service"}
                                </small>

                              </div>

                            </td>

                            {/* DATE */}

                            <td>

                              <span className="booking-date-cell">

                                <CalendarDays
                                  size={14}
                                />

                                {formatDate(
                                  request.bookingDate
                                )}

                              </span>

                            </td>

                            {/* TIME */}

                            <td>

                              <span className="booking-time-cell">

                                <Clock
                                  size={14}
                                />

                                {
                                  request.bookingTime
                                }

                              </span>

                            </td>

                            {/* AMOUNT */}

                            <td>

                              <strong className="booking-amount-cell">

                                <IndianRupee
                                  size={14}
                                />

                                {Number(
                                  request.price ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}

                              </strong>

                            </td>

                            {/* CONTACT */}

                            <td>

                              {customerPhone ? (

                                <a
                                  href={`tel:${customerPhone}`}
                                  className="booking-phone-cell"
                                >

                                  <Phone
                                    size={14}
                                  />

                                  {customerPhone}

                                </a>

                              ) : (

                                <span>
                                  Not available
                                </span>

                              )}

                            </td>

                            {/* STATUS */}

                            <td>

                              {/* PENDING */}

                              {request.status ===
                                "REQUESTED" && (

                                <span className="booking-status pending">

                                  <Clock
                                    size={14}
                                  />

                                  PENDING

                                </span>

                              )}

                              {/* ACCEPTED */}

                              {request.status ===
                                "ACCEPTED" && (

                                <span className="booking-status accepted">

                                  <CheckCircle
                                    size={14}
                                  />

                                  ACCEPTED

                                </span>

                              )}

                              {/* COMPLETED */}

                              {request.status ===
                                "COMPLETED" && (

                                <span className="booking-status completed">

                                  <CheckCircle
                                    size={14}
                                  />

                                  COMPLETED

                                </span>

                              )}

                              {/* REJECTED */}

                              {request.status ===
                                "REJECTED" && (

                                <span className="booking-status rejected">

                                  <XCircle
                                    size={14}
                                  />

                                  REJECTED

                                </span>

                              )}

                            </td>

                            {/* ACTION */}

                            {activeTab ===
                              "PENDING" && (

                              <td>

                                <div className="booking-action-buttons">

                                  <button
                                    type="button"
                                    className="booking-accept-btn"
                                    disabled={
                                      isActionLoading
                                    }
                                    onClick={() =>
                                      handleAccept(
                                        request._id
                                      )
                                    }
                                  >

                                    {isActionLoading ? (
                                      <LoaderCircle
                                        size={15}
                                        className="loading-spinner"
                                      />
                                    ) : (
                                      <CheckCircle
                                        size={15}
                                      />
                                    )}

                                    Accept

                                  </button>

                                  <button
                                    type="button"
                                    className="booking-reject-btn"
                                    disabled={
                                      isActionLoading
                                    }
                                    onClick={() =>
                                      handleReject(
                                        request._id
                                      )
                                    }
                                  >

                                    <XCircle
                                      size={15}
                                    />

                                    Reject

                                  </button>

                                </div>

                              </td>

                            )}

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </section>

      </main>

    </div>
  );
}

export default ProviderRequests;