import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Home,
  Search,
  CalendarCheck,
  MessageSquare,
  User,
  LogOut,
  Bell,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Clock,
  CreditCard,
  Star,
} from "lucide-react";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
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
};


function ReviewBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  /* =====================================================
     NORMAL BOOKING DATA
     Comes from Find Services
  ===================================================== */

  const selectedService =
    location.state?.service;

  const selectedProvider =
    location.state?.provider;

  const customerLocation =
    location.state?.customerLocation;


  /* =====================================================
     REVIEW DATA
     Comes from My Bookings -> Rate & Review
  ===================================================== */

  const reviewMode =
    location.state?.reviewMode === true;

  const selectedBooking =
    location.state?.booking;


  /* =====================================================
     BOOKING STATES
  ===================================================== */

  const [bookingDate, setBookingDate] =
    useState("");

  const [bookingTime, setBookingTime] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

  const [loading, setLoading] =
    useState(false);

  const [bookingSuccess, setBookingSuccess] =
    useState(false);

  const [bookingId, setBookingId] =
    useState("");


  /* =====================================================
     REVIEW STATES
  ===================================================== */

  const [rating, setRating] =
    useState(0);

  const [hoverRating, setHoverRating] =
    useState(0);

  const [reviewText, setReviewText] =
    useState("");

  const [reviewSubmitted, setReviewSubmitted] =
    useState(false);


  /* =====================================================
     USER
  ===================================================== */

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );


  /* =====================================================
     SUBMIT REVIEW
  ===================================================== */
const handleSubmitReview = async (e) => {
  e.preventDefault();

  if (rating === 0) {
    alert("Please select a rating first.");
    return;
  }

  const bookingId =
    selectedBooking?._id ||
    selectedBooking?.id ||
    selectedBooking?.bookingId;

  if (!bookingId) {
    alert("Booking ID not found. Please open the review from My Bookings.");
    return;
  }

  if (!user?.id) {
    alert("Please login again.");
    navigate("/login");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(
      "http://localhost:5000/api/reviews",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          customerId: user.id,
          rating,
          comment: reviewText.trim(),
        }),
      }
    );

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
  /* =====================================================
     CONFIRM BOOKING
  ===================================================== */

 
const handleConfirmBooking = async (e) => {
  e.preventDefault();

  if (!user?.id) {
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

  try {
    setLoading(true);

    // 1. Create booking in MongoDB
    const response = await fetch(
      "http://localhost:5000/api/bookings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: user.id,
          providerId: selectedProvider.id,
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
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success || !data.booking?._id) {
      throw new Error(data.message || "Booking failed.");
    }

    const newBookingId = data.booking._id;
    setBookingId(newBookingId);

    // 2. Cash payment: booking is created, no online checkout
    if (paymentMethod === "CASH") {
      setBookingSuccess(true);
      return;
    }

    // 3. Load Razorpay checkout
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error("Razorpay checkout could not load.");
    }

    // 4. Create Razorpay order on backend
    const orderResponse = await fetch(
      "http://localhost:5000/api/payments/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: newBookingId,
          customerId: user.id,
        }),
      }
    );

    const orderData = await orderResponse.json();

    if (!orderResponse.ok || !orderData.success) {
      throw new Error(orderData.message || "Could not create payment order.");
    }

    // Stop loading before opening checkout
    setLoading(false);

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Homezy",
      description: selectedService.name,
      order_id: orderData.orderId,

      handler: async (paymentResponse) => {
        try {
          setLoading(true);

          // 5. Verify payment on backend
          const verifyResponse = await fetch(
            "http://localhost:5000/api/payments/verify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                bookingId: newBookingId,
                customerId: user.id,
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
            error.message +
              " Your booking may still exist. Check My Bookings before retrying."
          );
        } finally {
          setLoading(false);
        }
      },

      modal: {
        ondismiss: () => {
          setLoading(false);
          alert(
            "Payment window closed. Your booking may still exist with payment pending. Check My Bookings before retrying."
          );
        },
      },

      theme: {
        color: "#4F46E5",
      },
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


  /* =====================================================
     SIDEBAR
  ===================================================== */

  const Sidebar = ({
    active = "",
  }) => (
    <aside className="customer-sidebar">

      <div className="sidebar-logo">

        <Home size={26} />

        <span>
          Homezy
        </span>

      </div>


      <nav className="sidebar-menu">

        <a
          href="/customer"
          className={
            active === "dashboard"
              ? "active"
              : ""
          }
        >
          <Home size={20} />
          Dashboard
        </a>


        <a
          href="/customer/find-services"
          className={
            active === "find"
              ? "active"
              : ""
          }
        >
          <Search size={20} />
          Find Services
        </a>


        <a
          href="/customer/bookings"
          className={
            active === "bookings"
              ? "active"
              : ""
          }
        >
          <CalendarCheck size={20} />
          My Bookings
        </a>


        <a href="/customer/complaints">
          <MessageSquare size={20} />
          Complaints
        </a>


        <a href="/customer/profile">
          <User size={20} />
          My Profile
        </a>

      </nav>


      <div className="sidebar-bottom">

        <a href="/login">

          <LogOut size={20} />

          Logout

        </a>

      </div>

    </aside>
  );


  /* =====================================================
     HEADER
  ===================================================== */

  const Header = ({
    title,
    subtitle,
  }) => (
    <header className="customer-header">

      <div>

        <h1>
          {title}
        </h1>

        <p>
          {subtitle}
        </p>

      </div>


      <div className="header-actions">

        <button
          type="button"
          className="notification-button"
        >
          <Bell size={21} />
        </button>


        <button
          type="button"
          className="profile-circle"
          onClick={() =>
            navigate(
              "/customer/profile"
            )
          }
        >
          {user?.name
            ?.charAt(0)
            ?.toUpperCase() || "U"}
        </button>

      </div>

    </header>
  );


  /* =====================================================
     REVIEW SUCCESS SCREEN
  ===================================================== */

  if (
    reviewMode &&
    reviewSubmitted
  ) {

    return (

      <div className="customer-layout">

        <Sidebar active="bookings" />


        <main className="customer-main">

          <Header
            title="Review Submitted"
            subtitle="Thank you for sharing your experience."
          />


          <div className="review-success-card">

            <div className="review-success-icon">

              <CheckCircle
                size={48}
              />

            </div>


            <h2>
              Thank You! 🎉
            </h2>


            <p>

              Your review for{" "}

              <strong>
                {selectedBooking?.service ||
                  "this service"}
              </strong>{" "}

              has been submitted successfully.

            </p>


            <div className="submitted-booking-details">

              <p>

                <strong>
                  Provider:
                </strong>{" "}

                {selectedBooking?.provider ||
                  "Provider"}

              </p>


              <p>

                <strong>
                  Rating:
                </strong>{" "}

                <span
                  style={{
                    color: "#f59e0b",
                    fontSize: "20px",
                  }}
                >

                  {"★".repeat(rating)}

                  {"☆".repeat(
                    5 - rating
                  )}

                </span>

              </p>


              {reviewText.trim() && (

                <p>

                  <strong>
                    Review:
                  </strong>{" "}

                  {reviewText}

                </p>

              )}

            </div>


            <button
              type="button"
              className="primary-booking-button"
              onClick={() =>
                navigate(
                  "/customer/bookings"
                )
              }
            >
              Back to My Bookings
            </button>

          </div>

        </main>

      </div>

    );
  }


  /* =====================================================
     REVIEW FORM
     My Bookings -> Rate & Review
  ===================================================== */

  if (
    reviewMode &&
    selectedBooking
  ) {

    return (

      <div className="customer-layout">

        <Sidebar active="bookings" />


        <main className="customer-main">

          <Header
            title="Rate & Review"
            subtitle="Share your experience with the service provider."
          />


          {/* BACK BUTTON */}

          <button
            type="button"
            className="review-back-button"
            onClick={() =>
              navigate(
                "/customer/bookings"
              )
            }
          >

            <ArrowLeft size={18} />

            Back to My Bookings

          </button>


          {/* REVIEW CARD */}

          <section className="review-card">


            {/* SERVICE */}

            <div className="review-service-info">

              <div className="review-service-icon">

                <Star size={28} />

              </div>


              <div>

                <h2>
                  {selectedBooking.service}
                </h2>

                <p>
                  {selectedBooking.provider}
                </p>

                <span>

                  {selectedBooking.date}

                  {selectedBooking.time
                    ? ` • ${selectedBooking.time}`
                    : ""}

                </span>

              </div>

            </div>


            <div className="review-divider"></div>


            {/* RATING */}

            <div
              className="rating-section"
              style={{
                textAlign: "center",
                padding: "15px 0 25px",
              }}
            >

              <h2>
                How was your experience?
              </h2>


              <p>
                Please rate the service you received.
              </p>


              <div
                className="rating-stars"
                style={{
                  display: "flex",
                  justifyContent:
                    "center",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >

                {[1, 2, 3, 4, 5].map(
                  (star) => (

                    <button
                      key={star}
                      type="button"
                      className="rating-star-button"
                      onMouseEnter={() =>
                        setHoverRating(
                          star
                        )
                      }
                      onMouseLeave={() =>
                        setHoverRating(0)
                      }
                      onClick={() =>
                        setRating(star)
                      }
                      style={{
                        border: "none",
                        background:
                          "transparent",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                    >

                      <Star
                        size={40}
                        fill={
                          star <=
                          (hoverRating ||
                            rating)
                            ? "currentColor"
                            : "none"
                        }
                      />

                    </button>

                  )
                )}

              </div>


              {(hoverRating ||
                rating) > 0 && (

                <p
                  style={{
                    marginTop: "12px",
                    fontWeight: "600",
                  }}
                >

                  {(
                    hoverRating ||
                    rating
                  ) === 1 &&
                    "Poor"}

                  {(
                    hoverRating ||
                    rating
                  ) === 2 &&
                    "Could be better"}

                  {(
                    hoverRating ||
                    rating
                  ) === 3 &&
                    "Good"}

                  {(
                    hoverRating ||
                    rating
                  ) === 4 &&
                    "Very Good"}

                  {(
                    hoverRating ||
                    rating
                  ) === 5 &&
                    "Excellent!"}

                </p>

              )}

            </div>


            {/* REVIEW TEXT */}

            <div className="review-input-section">

              <label
                htmlFor="reviewText"
              >

                Write a review

                <span>
                  Optional
                </span>

              </label>


              <textarea
                id="reviewText"
                rows="5"
                maxLength={500}
                placeholder="Tell us about your experience with this provider..."
                value={reviewText}
                onChange={(e) =>
                  setReviewText(
                    e.target.value
                  )
                }
              />


              <div className="character-count">

                {reviewText.length}/500

              </div>

            </div>


            {/* SUBMIT */}

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
                fontSize: "13px",
                marginTop: "12px",
              }}
            >
              Your feedback helps other customers
              choose the right professional.
            </p>

          </section>

        </main>

      </div>

    );

  }


  /* =====================================================
     DIRECT OPEN WITHOUT SERVICE
  ===================================================== */

  if (
    !selectedService ||
    !selectedProvider
  ) {

    return (

      <div className="customer-layout">

        <Sidebar />


        <main className="customer-main">

          <Header
            title="Review Booking"
            subtitle="No service selected."
          />


          <div className="review-card">

            <h2>
              Please select a service first.
            </h2>


            <button
              type="button"
              className="primary-booking-button"
              onClick={() =>
                navigate(
                  "/customer/find-services"
                )
              }
            >
              Find Services
            </button>

          </div>

        </main>

      </div>

    );

  }


  /* =====================================================
     BOOKING SUCCESS SCREEN
  ===================================================== */

  if (bookingSuccess) {

    return (

      <div className="customer-layout">

        <Sidebar active="bookings" />


        <main className="customer-main">

          <Header
            title="Booking Confirmed"
            subtitle="Your service request has been sent to the provider."
          />


          <div className="review-success-card">

            <div className="review-success-icon">

              <CheckCircle
                size={48}
              />

            </div>


            <h2>
              Booking Request Sent!
            </h2>


            <p>

              Your booking request for{" "}

              <strong>
                {selectedService.name}
              </strong>{" "}

              has been successfully created.

            </p>


            {bookingId && (

              <p>

                <strong>
                  Booking ID:
                </strong>{" "}

                {bookingId}

              </p>

            )}


            <div className="submitted-booking-details">

              <p>

                <strong>
                  Provider:
                </strong>{" "}

                {selectedProvider.name}

              </p>


              <p>

                <strong>
                  Date:
                </strong>{" "}

                {bookingDate}

              </p>


              <p>

                <strong>
                  Time:
                </strong>{" "}

                {bookingTime}

              </p>


              <p>

                <strong>
                  Amount:
                </strong>{" "}

                ₹{selectedService.price}

              </p>


              <p>

                <strong>
                  Payment:
                </strong>{" "}

                {paymentMethod ===
                "CASH"
                  ? "Cash on Service"
                  : "Razorpay"}

              </p>

            </div>


            <button
              type="button"
              className="primary-booking-button"
              onClick={() =>
                navigate(
                  "/customer/bookings"
                )
              }
            >
              View My Bookings
            </button>

          </div>

        </main>

      </div>

    );

  }


  /* =====================================================
     NORMAL BOOKING REVIEW PAGE
     Find Services -> Provider -> Review Booking
  ===================================================== */

  return (

    <div className="customer-layout">

      <Sidebar active="find" />


      <main className="customer-main">

        <Header
          title="Review Booking"
          subtitle="Check your booking details before confirming."
        />


        {/* BACK */}

        <button
          type="button"
          className="review-back-button"
          onClick={() =>
            navigate(
              "/customer/find-services"
            )
          }
        >

          <ArrowLeft size={18} />

          Back to Services

        </button>


        {/* BOOKING CARD */}

        <section className="review-card">


          {/* SERVICE */}

          <div className="review-service-info">

            <div className="review-service-icon">

              <Home size={28} />

            </div>


            <div>

              <h2>
                {selectedService.name}
              </h2>

              <p>
                {selectedProvider.name}
              </p>

              <span>
                {selectedService.category}
              </span>

            </div>

          </div>


          <div className="review-divider"></div>


          {/* PRICE */}

          <div className="booking-price-row">

            <span>
              Service Price
            </span>

            <strong>
              ₹{selectedService.price}
            </strong>

          </div>


          {/* PROVIDER */}

          <div className="booking-info-box">

            <div className="booking-info-icon">

              <User size={20} />

            </div>


            <div>

              <h3>
                Service Provider
              </h3>

              <p>
                {selectedProvider.name}
              </p>

              {selectedProvider.phone && (

                <small>
                  {selectedProvider.phone}
                </small>

              )}

            </div>

          </div>


          {/* PROVIDER ADDRESS */}

          {selectedProvider.address && (

            <div className="booking-info-box">

              <div className="booking-info-icon">

                <MapPin size={20} />

              </div>


              <div>

                <h3>
                  Provider Location
                </h3>

                <p>
                  {selectedProvider.address}
                </p>

              </div>

            </div>

          )}


          {/* CUSTOMER LOCATION */}

          <div className="booking-info-box">

            <div className="booking-info-icon">

              <MapPin size={20} />

            </div>


            <div>

              <h3>
                Your Service Location
              </h3>

              <p>

                {customerLocation?.address ||
                  "Location not selected"}

              </p>

            </div>

          </div>


          <div className="review-divider"></div>


          {/* BOOKING FORM */}

          <form
            onSubmit={
              handleConfirmBooking
            }
          >

            <div className="booking-form-grid">


              {/* DATE */}

              <div className="booking-form-group">

                <label htmlFor="bookingDate">

                  <CalendarCheck
                    size={17}
                  />

                  Select Date

                </label>


                <input
                  id="bookingDate"
                  type="date"
                  value={bookingDate}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    setBookingDate(
                      e.target.value
                    )
                  }
                  required
                />

              </div>


              {/* TIME */}

              <div className="booking-form-group">

                <label htmlFor="bookingTime">

                  <Clock size={17} />

                  Select Time

                </label>


                <input
                  id="bookingTime"
                  type="time"
                  value={bookingTime}
                  onChange={(e) =>
                    setBookingTime(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

            </div>


            {/* PAYMENT */}

            <div className="payment-section">

              <h3>

                <CreditCard
                  size={20}
                />

                Payment Method

              </h3>


              <div className="payment-options">


                {/* CASH */}

                <label
                  className={`payment-option ${
                    paymentMethod ===
                    "CASH"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH"
                    checked={
                      paymentMethod ===
                      "CASH"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />


                  <div>

                    <strong>
                      Cash on Service
                    </strong>

                    <p>
                      Pay the provider after the service.
                    </p>

                  </div>

                </label>


                {/* RAZORPAY */}

                <label
                  className={`payment-option ${
                    paymentMethod ===
                    "RAZORPAY"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={
                      paymentMethod ===
                      "RAZORPAY"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />


                  <div>

                    <strong>
                      Razorpay
                    </strong>

                    <p>
                      Online payment.
                    </p>

                  </div>

                </label>

              </div>

            </div>


            {/* TOTAL */}

            <div className="booking-total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹{selectedService.price}
              </strong>

            </div>


            {/* CONFIRM */}

            <button
              type="submit"
              className="submit-review-button"
              disabled={loading}
            >

              <CheckCircle size={18} />

              {loading
                ? "Creating Booking..."
                : "Confirm Booking"}

            </button>

          </form>

        </section>

      </main>

    </div>

  );
}

export default ReviewBooking;