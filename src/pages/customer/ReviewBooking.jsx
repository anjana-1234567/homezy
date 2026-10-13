
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  User,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Clock,
  CreditCard,
  Star,
} from "lucide-react";
import { API_ENDPOINTS } from "../../config/api";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function ReviewBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedService = location.state?.service;
  const selectedProvider = location.state?.provider;
  const customerLocation = location.state?.customerLocation;

  const reviewMode = location.state?.reviewMode === true;
  const selectedBooking = location.state?.booking;

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const getUserId = () => user?.id || user?._id;

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a rating first.");
      return;
    }

    const currentBookingId =
      selectedBooking?._id ||
      selectedBooking?.id ||
      selectedBooking?.bookingId;

    if (!currentBookingId) {
      alert("Booking ID not found. Please open the review from My Bookings.");
      return;
    }

    const customerId = getUserId();

    if (!customerId) {
      alert("Please login again.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_ENDPOINTS.REVIEWS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: currentBookingId,
          customerId,
          rating,
          comment: reviewText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not submit review.");
      }

      setReviewSubmitted(true);
    } catch (error) {
      console.error("Review submission error:", error);
      alert(error.message || "Unable to submit review.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    const customerId = getUserId();

    if (!customerId) {
      alert("Please login again.");
      navigate("/login");
      return;
    }

    if (!selectedService || !selectedProvider) {
      alert("Please select a service and provider.");
      return;
    }

    if (!bookingDate || !bookingTime) {
      alert("Please select booking date and time.");
      return;
    }

    const providerId = selectedProvider.id || selectedProvider._id;

    if (!providerId) {
      alert("Provider ID not found. Please select the provider again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          providerId,
          service: selectedService.name,
          category: selectedService.category || "",
          bookingDate,
          bookingTime,
          price: Number(selectedService.price),
          customerLocation: {
            latitude: customerLocation?.latitude ?? null,
            longitude: customerLocation?.longitude ?? null,
            address: customerLocation?.address || "",
          },
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.booking?._id) {
        throw new Error(data.message || "Booking failed.");
      }

      const newBookingId = data.booking._id;
      setBookingId(newBookingId);

      if (paymentMethod === "CASH") {
        setBookingSuccess(true);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Razorpay checkout could not load.");
      }

      const orderResponse = await fetch(
        `${API_ENDPOINTS.PAYMENTS}/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: newBookingId,
            customerId,
          }),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.message || "Could not create payment order.");
      }

      const options = {
        key: orderData.keyId || "rzp_test_Tmjnygk2th7v2b",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Homezy",
        description: selectedService.name,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "customer@homezy.com",
          contact: user?.phone || "9876543210",
        },

        handler: async (paymentResponse) => {
          try {
            setLoading(true);

            const verifyResponse = await fetch(
              `${API_ENDPOINTS.PAYMENTS}/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bookingId: newBookingId,
                  customerId,
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            setBookingSuccess(true);
          } catch (error) {
            console.error("Payment verification error:", error);
            alert(
              `${error.message} Check My Bookings to track your booking.`
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },

        theme: { color: "#4F46E5" },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (failure) => {
        console.error("Razorpay payment failed:", failure.error);
        alert("Payment failed. Please check My Bookings before trying again.");
      });

      checkout.open();
    } catch (error) {
      console.error("Booking/payment error:", error);
      alert(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const Header = ({ title, subtitle }) => (
    <header className="customer-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="profile-circle"
          onClick={() => navigate("/customer/profile")}
          aria-label="Open profile"
        >
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </button>
      </div>
    </header>
  );

  const goToBookings = () => navigate("/customer/bookings");

  if (reviewMode && reviewSubmitted) {
    return (
      <>
        <Header
          title="Review Submitted"
          subtitle="Thank you for sharing your experience."
        />

        <div className="review-success-card">
          <div className="review-success-icon">
            <CheckCircle size={48} />
          </div>

          <h2>Thank You! 🎉</h2>

          <p>
            Your review for{" "}
            <strong>{selectedBooking?.service || "this service"}</strong>{" "}
            has been submitted successfully.
          </p>

          <div className="submitted-booking-details">
            <p>
              <strong>Provider:</strong>{" "}
              {selectedBooking?.provider || "Provider"}
            </p>

            <p>
              <strong>Rating:</strong>{" "}
              <span style={{ color: "#f59e0b", fontSize: 20 }}>
                {"★".repeat(rating)}
                {"☆".repeat(5 - rating)}
              </span>
            </p>

            {reviewText.trim() && (
              <p>
                <strong>Review:</strong> {reviewText}
              </p>
            )}
          </div>

          <button
            type="button"
            className="primary-booking-button"
            onClick={goToBookings}
          >
            Back to My Bookings
          </button>
        </div>
      </>
    );
  }

  if (reviewMode && selectedBooking) {
    return (
      <>
        <Header
          title="Rate & Review"
          subtitle="Share your experience with the service provider."
        />

        <button
          type="button"
          className="review-back-button"
          onClick={goToBookings}
        >
          <ArrowLeft size={18} />
          Back to My Bookings
        </button>

        <section className="review-card">
          <div className="review-service-info">
            <div className="review-service-icon">
              <Star size={28} />
            </div>

            <div>
              <h2>{selectedBooking.service}</h2>
              <p>{selectedBooking.provider}</p>
              <span>
                {selectedBooking.date}
                {selectedBooking.time ? ` • ${selectedBooking.time}` : ""}
              </span>
            </div>
          </div>

          <div className="review-divider" />

          <div
            className="rating-section"
            style={{ textAlign: "center", padding: "15px 0 25px" }}
          >
            <h2>How was your experience?</h2>
            <p>Please rate the service you received.</p>

            <div
              className="rating-stars"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                marginTop: 20,
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="rating-star-button"
                  aria-label={`Rate ${star} out of 5`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <Star
                    size={40}
                    fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>

            {(hoverRating || rating) > 0 && (
              <p style={{ marginTop: 12, fontWeight: 600 }}>
                {{
                  1: "Poor",
                  2: "Could be better",
                  3: "Good",
                  4: "Very Good",
                  5: "Excellent!",
                }[hoverRating || rating]}
              </p>
            )}
          </div>

          <div className="review-input-section">
            <label htmlFor="reviewText">
              Write a review <span>Optional</span>
            </label>

            <textarea
              id="reviewText"
              rows={5}
              maxLength={500}
              placeholder="Tell us about your experience with this provider..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <div className="character-count">{reviewText.length}/500</div>
          </div>

          <button
            type="button"
            className="submit-review-button"
            onClick={handleSubmitReview}
            disabled={loading}
          >
            <Star size={18} />
            {loading ? "Submitting..." : "Submit Review"}
          </button>

          <p
            style={{
              textAlign: "center",
              color: "#8b95a7",
              fontSize: 13,
              marginTop: 12,
            }}
          >
            Your feedback helps other customers choose the right professional.
          </p>
        </section>
      </>
    );
  }

  if (reviewMode && !selectedBooking) {
    return (
      <>
        <Header
          title="Rate & Review"
          subtitle="Open a completed booking from My Bookings to leave a review."
        />

        <section className="review-card">
          <h2>Booking details not found.</h2>
          <button
            type="button"
            className="primary-booking-button"
            onClick={goToBookings}
          >
            Back to My Bookings
          </button>
        </section>
      </>
    );
  }

  if (!selectedService || !selectedProvider) {
    return (
      <>
        <Header
          title="Review Booking"
          subtitle="No service selected."
        />

        <section className="review-card">
          <h2>Please select a service first.</h2>

          <button
            type="button"
            className="primary-booking-button"
            onClick={() => navigate("/customer/find-services")}
          >
            Find Services
          </button>
        </section>
      </>
    );
  }

  if (bookingSuccess) {
    return (
      <>
        <Header
          title="Booking Confirmed"
          subtitle="Your service request has been sent to the provider."
        />

        <div className="review-success-card">
          <div className="review-success-icon">
            <CheckCircle size={48} />
          </div>

          <h2>Booking Request Sent!</h2>

          <p>
            Your booking request for <strong>{selectedService.name}</strong>{" "}
            has been successfully created.
          </p>

          {bookingId && (
            <p>
              <strong>Booking ID:</strong> {bookingId}
            </p>
          )}

          <div className="submitted-booking-details">
            <p>
              <strong>Provider:</strong> {selectedProvider.name}
            </p>
            <p>
              <strong>Date:</strong> {bookingDate}
            </p>
            <p>
              <strong>Time:</strong> {bookingTime}
            </p>
            <p>
              <strong>Amount:</strong> ₹{selectedService.price}
            </p>
            <p>
              <strong>Payment:</strong>{" "}
              {paymentMethod === "CASH" ? "Cash on Service" : "Razorpay"}
            </p>
          </div>

          <button
            type="button"
            className="primary-booking-button"
            onClick={goToBookings}
          >
            View My Bookings
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Review Booking"
        subtitle="Check your booking details before confirming."
      />

      <button
        type="button"
        className="review-back-button"
        onClick={() => navigate("/customer/find-services")}
      >
        <ArrowLeft size={18} />
        Back to Services
      </button>

      <section className="review-card">
        <div className="review-service-info">
          <div className="review-service-icon">
            <Home size={28} />
          </div>

          <div>
            <h2>{selectedService.name}</h2>
            <p>{selectedProvider.name || "Pandu (Appliance Specialist)"}</p>
            <span>{selectedService.category}</span>
          </div>
        </div>

        <div className="review-divider" />

        <div className="booking-price-row">
          <span>Service Price</span>
          <strong>₹{selectedService.price}</strong>
        </div>

        <div className="booking-info-box">
          <div className="booking-info-icon">
            <User size={20} />
          </div>

          <div>
            <h3>Service Provider</h3>
            <p>{selectedProvider.name || "Pandu (Appliance Specialist)"}</p>
            <small>{selectedProvider.phone || "+91 92812 34822"}</small>
          </div>
        </div>

        <div className="booking-info-box">
          <div className="booking-info-icon">
            <MapPin size={20} />
          </div>

          <div>
            <h3>Provider Location</h3>
            <p>{selectedProvider.address || "Swarnagiri Colony, Ghatkesar, Hyderabad"}</p>
          </div>
        </div>

        <div className="booking-info-box">
          <div className="booking-info-icon">
            <MapPin size={20} />
          </div>

          <div>
            <h3>Your Service Location</h3>
            <p>{customerLocation?.address || "Location not selected"}</p>
          </div>
        </div>

        <div className="review-divider" />

        <form onSubmit={handleConfirmBooking}>
          <div className="booking-form-grid">
            <div className="booking-form-group">
              <label htmlFor="bookingDate">
                <CheckCircle size={17} />
                Select Date
              </label>

              <input
                id="bookingDate"
                type="date"
                value={bookingDate}
                min={new Date().toLocaleDateString("en-CA")}
                onChange={(e) => setBookingDate(e.target.value)}
                required
              />
            </div>

            <div className="booking-form-group">
              <label htmlFor="bookingTime">
                <Clock size={17} />
                Select Time
              </label>

              <input
                id="bookingTime"
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="payment-section">
            <h3>
              <CreditCard size={20} />
              Payment Method
            </h3>

            <div className="payment-options">
              <label
                className={`payment-option ${
                  paymentMethod === "CASH" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH"
                  checked={paymentMethod === "CASH"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <div>
                  <strong>Cash on Service</strong>
                  <p>Pay the provider after the service.</p>
                </div>
              </label>

              <label
                className={`payment-option ${
                  paymentMethod === "RAZORPAY" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <div>
                  <strong>Razorpay</strong>
                  <p>Online payment.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="booking-total">
            <span>Total Amount</span>
            <strong>₹{selectedService.price}</strong>
          </div>

          <button
            type="submit"
            className="submit-review-button"
            disabled={loading}
          >
            <CheckCircle size={18} />
            {loading ? "Creating Booking..." : "Confirm Booking"}
          </button>
        </form>
      </section>
    </>
  );
}

export default ReviewBooking;
