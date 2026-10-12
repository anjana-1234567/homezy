
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  MapPin,
  Bell,
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  Paintbrush,
  Settings,
  Scissors,
  Hand,
  Smile,
  Heart,
  Bug,
  Truck,
  Snowflake,
  Shirt,
  Sofa,
  ChevronRight,
  Navigation,
} from "lucide-react";

import {
  getSavedLocation,
  getCurrentLocation,
} from "../../utils/location";

function CustomerDashboard() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const userName = user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const [location, setLocation] = useState(() => getSavedLocation());
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    const savedLocation = getSavedLocation();

    if (
      savedLocation &&
      JSON.stringify(savedLocation) !== JSON.stringify(location)
    ) {
      setLocation(savedLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCurrentLocation = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setLocationLoading(true);
      setLocationMessage("Detecting your current location...");

      const userId = user._id || user.id || user.userId;
      const locationData = await getCurrentLocation(userId);

      setLocation(locationData);
      setLocationMessage("Current location saved successfully.");
    } catch (error) {
      console.error("Location error:", error);
      setLocationMessage(
        error.message || "Unable to get your current location."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const serviceCategories = [
    {
      title: "Home Maintenance",
      services: [
        { name: "Plumbing", icon: <Wrench size={28} /> },
        { name: "Electrical", icon: <Zap size={28} /> },
        { name: "Carpentry", icon: <Hammer size={28} /> },
        { name: "Painting", icon: <Paintbrush size={28} /> },
        { name: "Appliance Repair", icon: <Settings size={28} /> },
        { name: "AC Service", icon: <Snowflake size={28} /> },
      ],
    },
    {
      title: "Cleaning & Home Care",
      services: [
        { name: "Home Cleaning", icon: <Sparkles size={28} /> },
        { name: "Sofa & Carpet Cleaning", icon: <Sofa size={28} /> },
        { name: "Pest Control", icon: <Bug size={28} /> },
        { name: "Laundry", icon: <Shirt size={28} /> },
      ],
    },
    {
      title: "Beauty & Personal Care",
      services: [
        { name: "Haircut & Styling", icon: <Scissors size={28} /> },
        { name: "Head Massage", icon: <Hand size={28} /> },
        { name: "Manicure & Pedicure", icon: <Hand size={28} /> },
        { name: "Facial & Cleanup", icon: <Smile size={28} /> },
        { name: "Waxing", icon: <Sparkles size={28} /> },
        { name: "Makeup", icon: <Heart size={28} /> },
      ],
    },
    {
      title: "Moving & Other Services",
      services: [
        { name: "Home Shifting", icon: <Truck size={28} /> },
        { name: "Bridal Makeup", icon: <Heart size={28} /> },
        { name: "Party Makeup", icon: <Sparkles size={28} /> },
      ],
    },
  ];

  return (
    <div className="customer-dashboard-content">
      <header className="customer-header">
        <div>
          <h1>Good Morning, {userName} 👋</h1>
          <p>What service do you need today?</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="notification-button"
            aria-label="Notifications"
          >
            <Bell size={21} />
            <span />
          </button>

          <button
            type="button"
            className="profile-circle"
            onClick={() => navigate("/customer/profile")}
            aria-label="Open profile"
          >
            {userInitial}
          </button>
        </div>
      </header>

      <div className="location-bar">
        <MapPin size={20} />

        <div>
          <span>Your Location</span>
          <strong>{location?.address || "Location not set"}</strong>

          {locationMessage && (
            <small
              style={{
                display: "block",
                marginTop: "5px",
                fontSize: "12px",
              }}
            >
              {locationMessage}
            </small>
          )}
        </div>

        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={locationLoading}
        >
          <Navigation size={16} />
          {locationLoading ? "Detecting..." : "Change"}
        </button>
      </div>

      <div className="service-search">
        <Search size={22} />

        <input
          type="text"
          placeholder="Search for plumbing, beauty, cleaning..."
          onFocus={() => navigate("/customer/find-services")}
          aria-label="Search services"
        />

        <button
          type="button"
          onClick={() => navigate("/customer/find-services")}
        >
          Search
        </button>
      </div>

      <div className="emergency-card emergency-banner">
        <div>
          <h2 style={{ color: "#FFFFFF", fontWeight: 700 }}>
            Need a Service Now?
          </h2>

          <p>
            Find an available professional near you for urgent home services.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/customer/find-services")}
        >
          Emergency Booking
        </button>
      </div>

      {serviceCategories.map((category) => (
        <section className="dashboard-section" key={category.title}>
          <div className="section-heading">
            <div>
              <h2>{category.title}</h2>
              <p>Find trusted professionals near you</p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/customer/find-services")}
            >
              View All
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="services-grid">
            {category.services.map((service) => (
              <button
                type="button"
                className="service-card"
                key={service.name}
                onClick={() => navigate("/customer/find-services")}
              >
                <div className="service-icon">{service.icon}</div>
                <h3>{service.name}</h3>
                <p>Find nearby professionals</p>
              </button>
            ))}
          </div>
        </section>
      ))}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Upcoming Booking</h2>
            <p>Your recent service request</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/customer/bookings")}
          >
            View All
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="booking-card">
          <div className="booking-service-icon">
            <Wrench size={25} />
          </div>

          <div className="booking-info">
            <h3>Plumbing Service</h3>
            <p>Raj Kumar • 1.2 km away</p>
            <span>Today, 4:00 PM</span>
          </div>

          <div className="booking-status">ACCEPTED</div>
        </div>
      </section>
    </div>
  );
}

export default CustomerDashboard;
