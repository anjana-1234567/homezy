import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

import {
  Bell,
  MapPin,
  Mail,
  Phone,
  Edit3,
  Save,
  Lock,
  CheckCircle,
  Navigation,
  CalendarCheck,
  MessageSquare,
  Search,
} from "lucide-react";

import {
  getSavedLocation,
  getCurrentLocation,
} from "../../utils/location";

function Profile() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?._id || user?.id || user?.userId;

  const savedLocation = getSavedLocation(userId);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(
    savedLocation?.address || user?.address || ""
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const [totalBookings, setTotalBookings] = useState(0);
  const [completedServices, setCompletedServices] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setStatsLoading(false);
      return;
    }

    const fetchCustomerStats = async () => {
      try {
        setStatsLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/bookings/customer/${userId}`
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to fetch booking statistics.");
        }

        const bookings = Array.isArray(data.bookings) ? data.bookings : [];

        const validBookings = bookings.filter(
          (booking) =>
            booking.status !== "REJECTED" &&
            booking.status !== "CANCELLED"
        );

        setTotalBookings(validBookings.length);
        setCompletedServices(
          bookings.filter((booking) => booking.status === "COMPLETED").length
        );
      } catch (error) {
        console.error("CUSTOMER PROFILE STATS ERROR:", error);
        setTotalBookings(0);
        setCompletedServices(0);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchCustomerStats();
  }, [userId]);

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Please login to view your profile.</h2>
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{ marginTop: 20, padding: "10px 20px", cursor: "pointer" }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleSaveProfile = () => {
    const updatedUser = { ...user, name, email, phone, address };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setEditing(false);
    alert("Profile updated successfully.");
  };

  const handleCurrentLocation = async () => {
    try {
      if (!userId) {
        setLocationMessage("Please login again to use your location.");
        return;
      }

      setLocationLoading(true);
      setLocationMessage("Detecting your current location...");

      const locationData = await getCurrentLocation(userId);
      setAddress(locationData.address);

      const updatedUser = {
        ...user,
        address: locationData.address,
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        },
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setLocationMessage("Current location saved successfully.");
    } catch (error) {
      console.error("Location error:", error);
      setLocationMessage(error.message || "Unable to get your current location.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();

    if (!newPassword || !confirmPassword) {
      alert("Please enter both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    alert(
      "Password change UI completed. Connect this form to your backend to update the actual password."
    );

    setNewPassword("");
    setConfirmPassword("");
  };

  const userInitial = name ? name.charAt(0).toUpperCase() : "U";

  const userRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Customer";

  return (
    <>
      <header className="customer-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your personal information and account</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="notification-button"
            aria-label="Notifications"
          >
            <Bell size={21} />
          </button>

          <button type="button" className="profile-circle" aria-label="Profile">
            {userInitial}
          </button>
        </div>
      </header>

      <div className="location-bar">
        <MapPin size={20} />

        <div>
          <span>Your Location</span>
          <strong>{address || "Location not set"}</strong>
          {locationMessage && (
            <small style={{ display: "block", marginTop: 5, fontSize: 12 }}>
              {locationMessage}
            </small>
          )}
        </div>

        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={locationLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            cursor: locationLoading ? "not-allowed" : "pointer",
            opacity: locationLoading ? 0.7 : 1,
          }}
        >
          <Navigation size={16} />
          {locationLoading
            ? "Detecting..."
            : address
            ? "Change"
            : "Use Current Location"}
        </button>
      </div>

      <section className="profile-hero">
        <div className="profile-avatar">{userInitial}</div>

        <div className="profile-hero-info">
          <h2>{name || "User"}</h2>
          <p><Mail size={16} /> {email || "No email provided"}</p>
          <span className="customer-badge">
            <CheckCircle size={14} /> {userRole}
          </span>
        </div>

        <button
          type="button"
          className="edit-profile-button"
          onClick={() => setEditing(!editing)}
        >
          <Edit3 size={17} /> {editing ? "Cancel" : "Edit Profile"}
        </button>
      </section>

      <section className="profile-section">
        <div className="profile-section-heading">
          <div>
            <h2>Personal Information</h2>
            <p>Your basic account information</p>
          </div>
        </div>

        <div className="profile-form-grid">
          <div className="profile-field">
            <label htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              disabled={!editing}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-email">Email Address</label>
            <input
              id="profile-email"
              type="email"
              value={email}
              disabled={!editing}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-phone">Phone Number</label>
            <div className="input-with-icon">
              <Phone size={18} />
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                disabled={!editing}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-address">Location</label>
            <div className="input-with-icon">
              <MapPin size={18} />
              <input
                id="profile-address"
                type="text"
                value={address}
                disabled={!editing}
                onChange={(event) => setAddress(event.target.value)}
              />
            </div>
          </div>
        </div>

        {editing && (
          <button
            type="button"
            className="save-profile-button"
            onClick={handleSaveProfile}
          >
            <Save size={18} /> Save Changes
          </button>
        )}
      </section>

      <section className="profile-stats">
        <div className="profile-stat-card">
          <strong>{statsLoading ? "..." : totalBookings}</strong>
          <span>Total Bookings</span>
        </div>

        <div className="profile-stat-card">
          <strong>{statsLoading ? "..." : completedServices}</strong>
          <span>Completed Services</span>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-heading">
          <div>
            <h2>Change Password</h2>
            <p>Keep your Homezy account secure.</p>
          </div>
        </div>

        <form className="password-form" onSubmit={handlePasswordChange}>
          <div className="profile-field">
            <label htmlFor="new-password">New Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
          </div>

          <div className="profile-field">
            <label htmlFor="confirm-password">Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="save-profile-button">
            <Save size={18} /> Change Password
          </button>
        </form>
      </section>

      <section className="profile-section account-info-section">
        <div className="profile-section-heading">
          <div>
            <h2>Account Information</h2>
            <p>Information about your Homezy account</p>
          </div>
        </div>

        <div className="account-info-grid">
          <div>
            <span>Account Type</span>
            <strong>{userRole}</strong>
          </div>

          <div>
            <span>Account Status</span>
            <strong className="active-account">
              <CheckCircle size={15} /> Active
            </strong>
          </div>

          <div>
            <span>Member Since</span>
            <strong>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "Not available"}
            </strong>
          </div>
        </div>
      </section>

      <section className="profile-quick-links">
        <button
          type="button"
          onClick={() => navigate("/customer/bookings")}
        >
          <CalendarCheck size={20} />
          <div>
            <strong>My Bookings</strong>
            <span>View your service history</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/customer/complaints")}
        >
          <MessageSquare size={20} />
          <div>
            <strong>Complaints & Support</strong>
            <span>Get help with your bookings</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/customer/find-services")}
        >
          <Search size={20} />
          <div>
            <strong>Find Services</strong>
            <span>Book a new home service</span>
          </div>
        </button>
      </section>
    </>
  );
}

export default Profile;