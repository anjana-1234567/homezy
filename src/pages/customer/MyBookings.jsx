import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  Bell,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  XCircle,
  Navigation,
  CheckCircle,
  Paintbrush,
  Settings,
  Wrench,
  Sparkles,
  Zap,
  LoaderCircle,
  Phone,
  Check,
} from "lucide-react";

function MyBookings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptedPopup, setAcceptedPopup] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const previousStatuses = useRef({});
  const initializedStatuses = useRef(false);

  const fetchBookings = useCallback(async (silent = false) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const customerId =
      currentUser?.id || currentUser?._id || currentUser?.userId;

    if (!customerId) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/bookings/customer/${customerId}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch bookings.");
      }

      const latestBookings = data.bookings || [];
      const updatedStatuses = {};

      if (!initializedStatuses.current) {
        latestBookings.forEach((booking) => {
          updatedStatuses[booking._id] = booking.status;
        });

        previousStatuses.current = updatedStatuses;
        initializedStatuses.current = true;
      } else {
        latestBookings.forEach((booking) => {
          const oldStatus = previousStatuses.current[booking._id];

          if (oldStatus === "REQUESTED" && booking.status === "ACCEPTED") {
            setAcceptedPopup(booking);
            setNotificationCount((count) => count + 1);
          }

          updatedStatuses[booking._id] = booking.status;
        });

        previousStatuses.current = updatedStatuses;
      }

      setBookings(latestBookings);
      setError("");
    } catch (err) {
      console.error("Fetch bookings error:", err);
      if (!silent) setError(err.message || "Unable to load bookings.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();

    const intervalId = window.setInterval(() => {
      fetchBookings(true);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [fetchBookings]);

  const getStatusClass = (status) => {
    const classes = {
      COMPLETED: "completed",
      ACCEPTED: "accepted",
      REQUESTED: "requested",
      REJECTED: "rejected",
      CANCELLED: "cancelled",
    };
    return classes[status] || "";
  };

  const getServiceIcon = (service = "") => {
    const name = service.toLowerCase();

    if (name.includes("clean") || name.includes("wash")) {
      return <Sparkles size={25} />;
    }
    if (
      name.includes("repair") ||
      name.includes("plumb") ||
      name.includes("tap")
    ) {
      return <Wrench size={25} />;
    }
    if (
      name.includes("electric") ||
      name.includes("fan") ||
      name.includes("switch")
    ) {
      return <Zap size={25} />;
    }
    return <Settings size={25} />;
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getProviderName = (booking) => booking.providerId?.name || "Provider";
  const getProviderPhone = (booking) =>
    booking.providerId?.phone || booking.providerPhone || "";
  const getProviderAddress = (booking) => booking.providerId?.address || "";

  const handleReview = (booking) => {
    navigate("/customer/review", {
      state: {
        reviewMode: true,
        booking: {
          id: booking._id,
          service: booking.service,
          provider: getProviderName(booking),
          providerId: booking.providerId?._id || booking.providerId?.id || "",
          providerPhone: getProviderPhone(booking),
          providerAddress: getProviderAddress(booking),
          date: formatDate(booking.bookingDate),
          time: booking.bookingTime || "Not available",
          price: booking.price,
          status: booking.status,
          customerLocation: booking.customerLocation || null,
        },
      },
    });
  };

  const handleTrack = (booking) => {
    if (booking.status !== "ACCEPTED") {
      window.alert(
        "Provider mee booking accept chesina tarvatha tracking open avuthundi."
      );
      return;
    }

    navigate("/customer/track-provider", { state: { booking } });
  };

  const handleViewBooking = (booking) => {
    window.alert(
      `${booking.service}\n\n` +
        `Provider: ${getProviderName(booking)}\n` +
        (getProviderPhone(booking)
          ? `Phone: ${getProviderPhone(booking)}\n`
          : "") +
        `Date: ${formatDate(booking.bookingDate)}\n` +
        `Time: ${booking.bookingTime || "Not available"}\n` +
        `Price: ₹${booking.price ?? "Not available"}\n` +
        `Status: ${booking.status}\n` +
        `Payment: ${booking.paymentMethod || "Not available"}\n` +
        `Payment Status: ${booking.paymentStatus || "Not available"}`
    );
  };

  const handleCancel = async (booking) => {
    if (!window.confirm(`Are you sure you want to cancel ${booking.service}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${booking._id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CANCELLED" }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to cancel booking.");
      }

      window.alert("Booking cancelled successfully.");
      await fetchBookings(true);
    } catch (err) {
      console.error("Cancel booking error:", err);
      window.alert(err.message || "Unable to cancel booking.");
    }
  };

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  ).length;
  const upcomingBookings = bookings.filter((booking) =>
    ["REQUESTED", "ACCEPTED"].includes(booking.status)
  ).length;

  return (
    <>
      <header className="customer-header">
        <div>
          <h1>My Bookings</h1>
          <p>Track and manage all your service bookings</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="notification-button"
            title="Booking notifications"
            onClick={() => {
              setNotificationCount(0);
              fetchBookings(true);
            }}
          >
            <Bell size={21} />
            {notificationCount > 0 && (
              <span className="notification-count">{notificationCount}</span>
            )}
          </button>

          <button
            type="button"
            className="profile-circle"
            onClick={() => navigate("/customer/profile")}
          >
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </button>
        </div>
      </header>

      <div className="booking-summary-grid">
        <div className="summary-card">
          <div className="summary-icon"><CalendarCheck size={23} /></div>
          <div><span>Total Bookings</span><strong>{totalBookings}</strong></div>
        </div>

        <div className="summary-card">
          <div className="summary-icon"><Clock size={23} /></div>
          <div><span>Upcoming</span><strong>{upcomingBookings}</strong></div>
        </div>

        <div className="summary-card">
          <div className="summary-icon"><CheckCircle size={23} /></div>
          <div><span>Completed</span><strong>{completedBookings}</strong></div>
        </div>
      </div>

      <div className="bookings-page-heading">
        <div>
          <h2>Your Bookings</h2>
          <p>All your recent service requests are shown here.</p>
        </div>

        <button type="button" onClick={() => navigate("/customer/find-services")}>
          Book New Service <ChevronRight size={18} />
        </button>
      </div>

      {loading && (
        <div className="booking-empty-state">
          <LoaderCircle size={35} className="loading-spinner" />
          <h3>Loading your bookings...</h3>
          <p>Please wait while we fetch your bookings.</p>
        </div>
      )}

      {!loading && error && (
        <div className="booking-empty-state">
          <XCircle size={40} />
          <h3>Unable to load bookings</h3>
          <p>{error}</p>
          <button
            type="button"
            className="primary-booking-button"
            onClick={() => fetchBookings()}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="booking-empty-state">
          <CalendarCheck size={45} />
          <h3>No bookings yet</h3>
          <p>You haven't booked any services yet.</p>
          <button
            type="button"
            className="primary-booking-button"
            onClick={() => navigate("/customer/find-services")}
          >
            Find Services
          </button>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const providerPhone = getProviderPhone(booking);

            return (
              <div className="booking-list-card" key={booking._id}>
                <div className="booking-card-top">
                  <div className="booking-service-left">
                    <div className="booking-service-icon">
                      {getServiceIcon(booking.service)}
                    </div>
                    <div>
                      <h3>{booking.service}</h3>
                      <p>{getProviderName(booking)}</p>

                      <div className="provider-meta">
                        {providerPhone && (
                          <span><Phone size={14} /> {providerPhone}</span>
                        )}
                        {getProviderAddress(booking) && (
                          <span>
                            <MapPin size={14} /> {getProviderAddress(booking)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`booking-status ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </div>
                </div>

                <div className="booking-details">
                  <div className="booking-detail-item">
                    <CalendarCheck size={18} />
                    <div><span>Date</span><strong>{formatDate(booking.bookingDate)}</strong></div>
                  </div>

                  <div className="booking-detail-item">
                    <Clock size={18} />
                    <div><span>Time</span><strong>{booking.bookingTime || "Not available"}</strong></div>
                  </div>

                  <div className="booking-detail-item">
                    <span className="rupee-symbol">₹</span>
                    <div><span>Amount</span><strong>₹{booking.price ?? "—"}</strong></div>
                  </div>
                </div>

                <div className="booking-payment-info">
                  <span>
                    Payment: <strong>
                      {booking.paymentMethod === "CASH"
                        ? "Cash on Service"
                        : booking.paymentMethod || "Not available"}
                    </strong>
                  </span>
                  <span>
                    Status: <strong>{booking.paymentStatus || "Not available"}</strong>
                  </span>
                </div>

                {booking.customerLocation?.address && (
                  <div className="booking-location-info">
                    <MapPin size={17} />
                    <span>Service Location: {booking.customerLocation.address}</span>
                  </div>
                )}

                <div className="booking-actions">
                  {booking.status === "COMPLETED" && (
                    <>
                      <button
                        type="button"
                        className="primary-booking-button"
                        onClick={() => handleReview(booking)}
                      >
                        <Star size={17} /> Rate & Review
                      </button>
                      <button
                        type="button"
                        className="secondary-booking-button"
                        onClick={() => handleViewBooking(booking)}
                      >
                        View Booking
                      </button>
                    </>
                  )}

                  {["ACCEPTED", "REQUESTED"].includes(booking.status) && (
                    <>
                      <button
                        type="button"
                        className="primary-booking-button"
                        onClick={() => handleViewBooking(booking)}
                      >
                        <CheckCircle size={17} /> View Booking
                      </button>

                      <button
                        type="button"
                        className="secondary-booking-button"
                        onClick={() => handleTrack(booking)}
                      >
                        <Navigation size={17} /> Track Provider
                      </button>

                      {providerPhone && (
                        <a className="secondary-booking-button" href={`tel:${providerPhone}`}>
                          <Phone size={17} /> Call Provider
                        </a>
                      )}

                      {booking.status === "REQUESTED" && (
                        <button
                          type="button"
                          className="cancel-booking-button"
                          onClick={() => handleCancel(booking)}
                        >
                          <XCircle size={17} /> Cancel
                        </button>
                      )}
                    </>
                  )}

                  {["REJECTED", "CANCELLED"].includes(booking.status) && (
                    <button
                      type="button"
                      className="secondary-booking-button"
                      onClick={() => handleViewBooking(booking)}
                    >
                      View Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bookings-bottom-card">
        <div className="bottom-card-icon"><Paintbrush size={25} /></div>
        <div>
          <h3>Need another service?</h3>
          <p>Find trusted professionals for all your home needs.</p>
        </div>
        <button type="button" onClick={() => navigate("/customer/find-services")}>
          Find Services <ChevronRight size={18} />
        </button>
      </div>

      {acceptedPopup && (
        <div
          className="homezy-modal-backdrop"
          role="presentation"
          onClick={() => setAcceptedPopup(null)}
        >
          <section
            className="homezy-accepted-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accepted-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="homezy-modal-close"
              aria-label="Close popup"
              onClick={() => setAcceptedPopup(null)}
            >
              ×
            </button>

            <div className="homezy-accepted-icon"><Check size={32} /></div>
            <h2 id="accepted-title">Booking Accepted!</h2>
            <p className="homezy-accepted-message">
              Great news! Your service provider has accepted your booking.
            </p>

            <div className="homezy-provider-info">
              <strong>{getProviderName(acceptedPopup)}</strong>
              <span>{acceptedPopup.service}</span>
              {getProviderPhone(acceptedPopup) ? (
                <span><Phone size={15} /> {getProviderPhone(acceptedPopup)}</span>
              ) : (
                <span>Provider phone number is not available.</span>
              )}
              <span>
                <CalendarCheck size={15} />
                {formatDate(acceptedPopup.bookingDate)} · {acceptedPopup.bookingTime || "Not available"}
              </span>
            </div>

            <div className="homezy-modal-actions">
              {getProviderPhone(acceptedPopup) && (
                <a className="homezy-call-button" href={`tel:${getProviderPhone(acceptedPopup)}`}>
                  <Phone size={17} /> Call Provider
                </a>
              )}

              <button
                type="button"
                className="homezy-modal-secondary"
                onClick={() => {
                  setAcceptedPopup(null);
                  handleViewBooking(acceptedPopup);
                }}
              >
                View Booking
              </button>

              <button
                type="button"
                className="homezy-modal-secondary"
                onClick={() => {
                  setAcceptedPopup(null);
                  handleTrack(acceptedPopup);
                }}
              >
                <Navigation size={17} /> Track Provider
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default MyBookings;