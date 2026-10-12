
import { useState } from "react";
import {
  MessageCircle,
  Send,
  Headphones,
  CalendarCheck,
} from "lucide-react";
import "../../index.css";

const API_URL = "http://localhost:5000/api";

const quickQuestions = [
  "Check my booking",
  "Provider details",
  "Cancel or reschedule",
  "Payment issues",
  "Contact support",
];

function getCustomerId() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    localStorage.getItem("customerId") ||
    user._id ||
    user.id ||
    user.userId
  );
}

function getStatus(status) {
  const labels = {
    REQUESTED: "Waiting for provider confirmation",
    ACCEPTED: "Booking accepted",
    "ON THE WAY": "Provider is on the way",
    ON_THE_WAY: "Provider is on the way",
    COMPLETED: "Service completed",
    CANCELLED: "Booking cancelled",
    REJECTED: "Booking rejected",
  };

  return labels[String(status || "").toUpperCase()] ||
    status ||
    "Not available";
}

function getProvider(booking) {
  const provider = booking?.provider;

  if (provider && typeof provider === "object") {
    return provider;
  }

  const assignedProvider =
    booking?.assignedProvider ||
    booking?.providerDetails ||
    booking?.technician;

  if (assignedProvider && typeof assignedProvider === "object") {
    return assignedProvider;
  }

  return null;
}

function getProviderName(booking) {
  const provider =
    booking?.providerId ||
    booking?.provider ||
    booking?.assignedProvider ||
    booking?.providerDetails ||
    booking?.technician;

  if (provider && typeof provider === "object") {
    return (
      provider.name ||
      provider.fullName ||
      provider.businessName ||
      "Not assigned yet"
    );
  }

  return (
    booking?.providerName ||
    booking?.assignedProviderName ||
    booking?.technicianName ||
    "Not assigned yet"
  );
}

function getProviderPhone(booking) {
  const provider =
    booking?.providerId ||
    booking?.provider ||
    booking?.assignedProvider ||
    booking?.providerDetails ||
    booking?.technician;

  if (provider && typeof provider === "object") {
    return (
      provider.phone ||
      provider.phoneNumber ||
      provider.mobile ||
      provider.mobileNumber ||
      "Not available"
    );
  }

  return (
    booking?.providerPhone ||
    booking?.assignedProviderPhone ||
    booking?.technicianPhone ||
    "Not available"
  );
}
function getServiceName(booking) {
  return (
    booking?.serviceName ||
    booking?.service?.name ||
    (typeof booking?.service === "string" ? booking.service : null) ||
    booking?.category ||
    "Your service"
  );
}

export default function ContactSupport() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! 👋 Welcome to Homezy Support. How can I help you with your booking today?",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  function addMessage(sender, text) {
    setMessages((previous) => [...previous, { sender, text }]);
  }

  async function getBookings() {
    const customerId = getCustomerId();

    if (!customerId) {
      throw new Error("Please log in again to view your bookings.");
    }

    const response = await fetch(
      `${API_URL}/bookings/customer/${customerId}`
    );

    if (!response.ok) {
      throw new Error(
        "Couldn't load your bookings. Please try again."
      );
    }

    const data = await response.json();

    const bookings = Array.isArray(data)
      ? data
      : data.bookings || data.data || [];

    // If the API returns bookings in any order,
    // use the most recently created booking.
    return bookings.sort((a, b) => {
      const dateA = new Date(
        a.createdAt || a.bookingDate || a.date || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || b.bookingDate || b.date || 0
      ).getTime();

      return dateB - dateA;
    });
  }

  async function handleQuestion(question) {
    if (!question.trim() || loading) return;

    addMessage("user", question);
    setInput("");
    setLoading(true);

    try {
      const normalized = question.toLowerCase();

      if (
        normalized.includes("booking") ||
        normalized.includes("status") ||
        normalized.includes("provider") ||
        normalized.includes("service")
      ) {
        const bookings = await getBookings();

        if (!bookings.length) {
          addMessage("bot", "You don't have any bookings yet.");
          return;
        }

        const latest = bookings[0];
        const service = getServiceName(latest);
        const status = getStatus(latest.status);
        const providerName = getProviderName(latest);
        const providerPhone = getProviderPhone(latest);

        if (normalized.includes("provider")) {
          if (providerName === "Not assigned yet") {
            addMessage(
              "bot",
              `Service: ${service}\nBooking status: ${status}\n\nA provider has not been assigned to this booking yet. Please check again after the provider is assigned.`
            );
          } else {
            addMessage(
              "bot",
              `Provider details\nService: ${service}\nProvider: ${providerName}\nPhone: ${providerPhone}\nBooking status: ${status}`
            );
          }
        } else {
          addMessage(
            "bot",
            `Your latest booking details:\nService: ${service}\nStatus: ${status}\nProvider: ${providerName}\nPhone: ${providerPhone}`
          );
        }
      } else if (
        normalized.includes("cancel") ||
        normalized.includes("reschedule")
      ) {
        addMessage(
          "bot",
          "To cancel or reschedule, open My Bookings and check the available actions. I haven't changed your booking."
        );
      } else if (normalized.includes("payment")) {
        addMessage(
          "bot",
          "Please check your booking's payment status and payment method. If money was deducted but your booking wasn't confirmed, contact Homezy Support with your booking details."
        );
      } else if (
        normalized.includes("support") ||
        normalized.includes("human") ||
        normalized.includes("help")
      ) {
        addMessage(
          "bot",
          "Please contact the Homezy support team through your configured support channel. A live agent isn't connected to this chatbot yet."
        );
      } else {
        addMessage(
          "bot",
          "Please choose one of the options below so I can help with your booking."
        );
      }
    } catch (error) {
      addMessage(
        "bot",
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (input.trim()) {
      handleQuestion(input);
    }
  }

  return (
    <div className="homezy-support">
      <header className="support-header">
        <div className="support-title-icon">
          <Headphones size={26} />
        </div>

        <div>
          <h1>Contact &amp; Support</h1>
          <p>Homezy booking assistance</p>
        </div>
      </header>

      <section className="support-chat">
        <div className="support-chat-heading">
          <div className="support-avatar">
            <MessageCircle size={23} />
          </div>

          <div>
            <h2>Homezy Assistant</h2>
            <p>
              <span className="support-online-dot" />
              Ready to help
            </p>
          </div>
        </div>

        <div className="support-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`support-message-row ${
                message.sender === "user" ? "user-message-row" : ""
              }`}
            >
              <div
                className={`support-message ${
                  message.sender === "user"
                    ? "user-message"
                    : "bot-message"
                }`}
              >
                {message.text.split("\n").map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {line}
                    {lineIndex < message.text.split("\n").length - 1 && (
                      <br />
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="support-message bot-message">
              Checking your details...
            </div>
          )}
        </div>

        <div className="support-quick-questions">
          <p>How can I help?</p>

          {quickQuestions.map((question) => (
            <button
              key={question}
              type="button"
              disabled={loading}
              onClick={() => handleQuestion(question)}
            >
              {question}
            </button>
          ))}
        </div>

        <form className="support-input-area" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your question..."
            aria-label="Type your question"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send size={19} />
          </button>
        </form>

        <p className="support-note">
          <CalendarCheck size={15} />
          Booking information is retrieved from your account.
        </p>
      </section>
    </div>
  );
}
