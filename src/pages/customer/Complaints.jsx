import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  XCircle,
  CalendarCheck,
  MessageSquare,
} from "lucide-react";
import { API_ENDPOINTS } from "../../config/api";

function Complaints() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?._id || user?.id || user?.userId;

  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [complaintType, setComplaintType] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  };

  const getBookingId = (booking) =>
    booking?.bookingCode || booking?._id || "ID unavailable";

  const fetchBookings = async () => {
    if (!userId) {
      showMessage("Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.BOOKINGS}/customer/${userId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch bookings.");
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("FETCH BOOKINGS ERROR:", error);
      showMessage(error.message || "Unable to load your bookings.");
    }
  };

  const fetchComplaints = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.COMPLAINTS}/customer/${userId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch complaints.");
      }

      setComplaints(data.complaints || []);
    } catch (error) {
      console.error("FETCH COMPLAINTS ERROR:", error);
      showMessage(error.message || "Unable to load complaints.");
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchBookings(), fetchComplaints()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Load the customer's bookings and complaints when their ID changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const formatDate = (date) => {
    if (!date) return "Not available";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getProviderName = (booking) => {
    if (booking?.providerId && typeof booking.providerId === "object") {
      return booking.providerId.name || "Service Provider";
    }
    return "Service Provider";
  };

  const getComplaintForBooking = (booking) => {
    const bookingMongoId = String(booking?._id || "");

    const found = complaints.find((complaint) => {
      if (complaint?.complaint) {
        return String(complaint?._id || "") === bookingMongoId;
      }

      const linkedBookingId =
        complaint?.bookingId?._id || complaint?.bookingId;

      return String(linkedBookingId || "") === bookingMongoId;
    });

    if (found) return found;

    return booking?.complaint
      ? {
          ...booking.complaint,
          bookingId: booking._id,
          bookingCode: booking.bookingCode,
        }
      : null;
  };

  const handleSelectBooking = (booking) => {
    if (getComplaintForBooking(booking)) {
      showMessage("A complaint has already been raised for this booking.");
      return;
    }

    setMessage("");
    setMessageType("");
    setSelectedBooking(booking);
    setComplaintType("");
    setDescription("");
  };

  const handleCancel = () => {
    setSelectedBooking(null);
    setComplaintType("");
    setDescription("");
    setMessage("");
    setMessageType("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedBooking) {
      showMessage("Please select a booking first.");
      return;
    }

    if (!complaintType) {
      showMessage("Please select a complaint type.");
      return;
    }

    if (!description.trim()) {
      showMessage("Please describe your issue.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const response = await fetch(API_ENDPOINTS.COMPLAINTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          customerId: userId,
          complaintType,
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit complaint.");
      }

      setSelectedBooking(null);
      setComplaintType("");
      setDescription("");
      showMessage("Complaint submitted successfully.", "success");
      await Promise.all([fetchBookings(), fetchComplaints()]);
    } catch (error) {
      console.error("SUBMIT COMPLAINT ERROR:", error);
      showMessage(error.message || "Unable to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "RESOLVED") return "resolved";
    if (status === "IN REVIEW" || status === "IN_PROGRESS") return "review";
    return "open";
  };

  const getStatusIcon = (status) => {
    if (status === "RESOLVED") return <CheckCircle size={15} />;
    if (status === "IN REVIEW" || status === "IN_PROGRESS") {
      return <Clock size={15} />;
    }
    return <AlertCircle size={15} />;
  };

  const eligibleBookings = bookings.filter(
    (booking) => !["REJECTED", "CANCELLED"].includes(booking.status)
  );

  return (
    <>
      <header className="customer-header">
        <div>
          <h1>Complaints & Support</h1>
          <p>Get help with your Homezy bookings</p>
        </div>

        <div className="header-actions">
          <button type="button" className="notification-button" aria-label="Notifications">
            <Bell size={21} />
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

      {message && (
        <div
          role="alert"
          style={{
            marginBottom: 20,
            padding: "14px 18px",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: messageType === "success" ? "#ecfdf5" : "#fef2f2",
            color: messageType === "success" ? "#047857" : "#b91c1c",
            border: messageType === "success"
              ? "1px solid #a7f3d0"
              : "1px solid #fecaca",
          }}
        >
          {messageType === "success"
            ? <CheckCircle size={19} />
            : <AlertCircle size={19} />}
          {message}
        </div>
      )}

      <div className="complaint-support-banner">
        <div className="support-banner-icon"><MessageSquare size={28} /></div>
        <div>
          <h2 style={{ color: "#FFFFFF", fontWeight: 700 }}>Need Help?</h2>
          <p>Select one of your bookings below to raise a service-related complaint.</p>
        </div>
        <button
          type="button"
          onClick={() =>
            document.getElementById("my-bookings-for-complaint")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          View Bookings <ChevronRight size={18} />
        </button>
      </div>

      {selectedBooking && (
        <section className="complaint-section">
          <div className="section-heading">
            <div>
              <h2>Raise a Complaint</h2>
              <p>Your complaint will be linked directly to this booking.</p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Cancel complaint"
              style={{ border: 0, background: "transparent", cursor: "pointer" }}
            >
              <XCircle size={22} />
            </button>
          </div>

          <div style={{
            padding: 18,
            marginBottom: 22,
            borderRadius: 14,
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
          }}>
            <p style={{ margin: "0 0 8px", color: "#4f46e5", fontWeight: 700 }}>
              Booking ID: {getBookingId(selectedBooking)}
            </p>
            <strong>{selectedBooking.service}</strong>
            <p style={{ margin: "6px 0", color: "#6b7280" }}>
              {getProviderName(selectedBooking)}
            </p>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
              {formatDate(selectedBooking.bookingDate)} · {selectedBooking.bookingTime || "Not available"} · ₹{selectedBooking.price ?? "—"}
            </p>
          </div>

          <form className="complaint-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="complaint-type">Complaint Type</label>
              <select
                id="complaint-type"
                value={complaintType}
                onChange={(event) => setComplaintType(event.target.value)}
                required
              >
                <option value="">Select complaint type</option>
                <option value="Service Quality">Service Quality</option>
                <option value="Provider Late">Provider Late</option>
                <option value="Provider Behaviour">Provider Behaviour</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Booking Issue">Booking Issue</option>
                <option value="Incomplete Service">Incomplete Service</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="complaint-description">Describe your issue</label>
              <textarea
                id="complaint-description"
                rows={5}
                placeholder="Please explain what went wrong with this booking..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="submit-complaint-button"
              disabled={submitting}
            >
              <Send size={18} />
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </section>
      )}

      <section className="complaint-section" id="my-bookings-for-complaint">
        <div className="section-heading">
          <div>
            <h2>My Bookings</h2>
            <p>Select a booking to raise a complaint about that service.</p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
            Loading your bookings...
          </div>
        ) : eligibleBookings.length === 0 ? (
          <div style={{
            padding: 40,
            textAlign: "center",
            borderRadius: 16,
            background: "#f8fafc",
            color: "#6b7280",
          }}>
            <CalendarCheck size={42} style={{ marginBottom: 12 }} />
            <h3 style={{ color: "#111827" }}>No bookings available</h3>
            <p>Your eligible bookings will appear here.</p>
          </div>
        ) : (
          <div className="complaints-list">
            {eligibleBookings.map((booking) => {
              const complaint = getComplaintForBooking(booking);
              const hasComplaint = Boolean(complaint);

              return (
                <div className="complaint-card" key={booking._id}>
                  <div className="complaint-card-top">
                    <div className="complaint-title">
                      <div className="complaint-icon"><CalendarCheck size={22} /></div>
                      <div>
                        <h3>{booking.service}</h3>
                        <p style={{
                          margin: "5px 0 0",
                          color: "#4f46e5",
                          fontSize: 13,
                          fontWeight: 600,
                        }}>
                          Booking ID: {getBookingId(booking)}
                        </p>
                        <p>{getProviderName(booking)}</p>
                      </div>
                    </div>

                    <div className={`complaint-status ${
                      hasComplaint ? getStatusClass(complaint.status) : ""
                    }`}>
                      {hasComplaint ? (
                        <>
                          {getStatusIcon(complaint.status)}
                          {complaint.status}
                        </>
                      ) : (
                        <>
                          <CalendarCheck size={15} />
                          {booking.status}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="complaint-meta">
                    <span><CalendarCheck size={15} /> {formatDate(booking.bookingDate)}</span>
                    <span><Clock size={15} /> {booking.bookingTime || "Not available"}</span>
                    <span>₹{booking.price ?? "—"}</span>
                  </div>

                  {hasComplaint ? (
                    <div>
                      <p className="complaint-description">
                        <strong>{complaint.complaintType}</strong>
                        <br />
                        {complaint.description}
                      </p>
                      <div style={{ marginTop: 12, color: "#6b7280", fontSize: 13 }}>
                        Complaint submitted on {formatDate(complaint.createdAt)}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 15,
                      flexWrap: "wrap",
                    }}>
                      <p className="complaint-description">
                        Having an issue with this booking? Raise a complaint linked directly to this service.
                      </p>
                      <button
                        type="button"
                        className="submit-complaint-button"
                        onClick={() => handleSelectBooking(booking)}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <MessageSquare size={17} /> Raise Complaint
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

export default Complaints;