
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import RegisterCollage from "../components/RegisterCollage";
import { API_ENDPOINTS } from "../config/api";
import "../index.css";

const serviceCategories = {
  "Home Maintenance": [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "Home Cleaning",
    "Sofa & Carpet Cleaning",
    "Pest Control",
    "Laundry",
  ],
  "Appliance Services": [
    "AC Service",
    "AC Cleaning",
    "AC Repair",
    "Washing Machine Repair",
    "Refrigerator Repair",
    "TV Repair",
    "Microwave Repair",
    "Water Purifier Repair",
  ],
  "Beauty & Salon": [
    "Haircut & Styling",
    "Head Massage",
    "Manicure & Pedicure",
    "Facial & Cleanup",
    "Waxing",
    "Makeup",
    "Bridal Makeup",
    "Party Makeup",
  ],
  "Moving Services": [
    "Home Shifting",
    "Furniture Moving",
    "Packing & Unpacking",
  ],
  "Deep Cleaning": [
    "Full Home Cleaning",
    "Kitchen Cleaning",
    "Bathroom Cleaning",
    "Floor Cleaning",
    "Window Cleaning",
  ],
};

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    experience: "",
    address: "",
  });

  const [selectedServices, setSelectedServices] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleServiceChange = (service) => {
    setSelectedServices((previous) =>
      previous.includes(service)
        ? previous.filter((item) => item !== service)
        : [...previous, service]
    );
  };

  const handleRoleChange = (event) => {
    const newRole = event.target.value;

    setRole(newRole);
    setMessage("");

    if (newRole === "customer") {
      setSelectedServices([]);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (
      role === "provider" &&
      selectedServices.length === 0
    ) {
      setMessage("Please select at least one service category.");
      return;
    }

    if (
      role === "provider" &&
      (
        formData.experience === "" ||
        Number(formData.experience) < 0 ||
        formData.address.trim() === ""
      )
    ) {
      setMessage(
        "Please enter valid experience and service address."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.AUTH}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            password: formData.password,
            role,
            serviceCategories:
              role === "provider" ? selectedServices : [],
            experience:
              role === "provider" ? formData.experience : "",
            address:
              role === "provider"
                ? formData.address.trim()
                : "",
          }),
        }
      );

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = { message: `Server responded with status ${response.status}. Please try again.` };
      }

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setMessage(
        "Registration successful! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      setMessage(
        "Unable to connect to server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      {/* LEFT SIDE — REGISTRATION FORM */}
      <section className="register-left">
        <Link
          to="/"
          className="homezy-logo"
          aria-label="Homezy home"
        >
          <span className="homezy-logo-icon">
            <Home size={23} strokeWidth={2.2} />
          </span>

          <span>
            homezy<span className="logo-dot">.</span>
          </span>
        </Link>

        <div className="register-container">
          <div className="auth-eyebrow">
            <span className="eyebrow-line" />
            JOIN THE HOMEZY COMMUNITY
          </div>

          <h1>
            Your home deserves
            <br />
            <span>the right people.</span>
          </h1>

          <p className="register-subtitle">
            Create your account and make everyday home services
            simpler, safer, and more convenient.
          </p>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label htmlFor="name">Full name</label>

              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="phone">Phone number</label>

              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                autoComplete="tel"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="role">I want to join as</label>

              <select
                id="role"
                name="role"
                value={role}
                onChange={handleRoleChange}
              >
                <option value="customer">
                  Customer — book services
                </option>

                <option value="provider">
                  Service provider — offer services
                </option>
              </select>
            </div>

            {role === "provider" && (
              <div className="provider-fields">
                <div className="input-group">
                  <label>Service categories</label>

                  <p className="auth-helper">
                    Select every category you can provide.
                  </p>

                  <div className="auth-service-list">
                    {Object.entries(serviceCategories).map(
                      ([category, services]) => {
                        const checked =
                          selectedServices.includes(category);

                        return (
                          <label
                            className={`auth-service-option ${
                              checked ? "selected" : ""
                            }`}
                            key={category}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                handleServiceChange(category)
                              }
                            />

                            <span className="service-option-content">
                              <strong>{category}</strong>

                              <small>
                                {services.slice(0, 3).join(" · ")}
                              </small>
                            </span>

                            {checked && (
                              <span className="service-check">
                                ✓
                              </span>
                            )}
                          </label>
                        );
                      }
                    )}
                  </div>

                  {selectedServices.length > 0 && (
                    <p className="auth-helper selected-count">
                      {selectedServices.length} categor
                      {selectedServices.length === 1
                        ? "y"
                        : "ies"}{" "}
                      selected
                    </p>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="experience">
                    Years of experience
                  </label>

                  <input
                    id="experience"
                    type="number"
                    name="experience"
                    min="0"
                    step="1"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="address">Service address</label>

                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your service address"
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="password">Create password</label>

              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  className="eye-button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="password-input">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  className="eye-button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {message && (
              <p
                className={`auth-message ${
                  message.includes("successful")
                    ? "success"
                    : "error"
                }`}
                role="status"
                aria-live="polite"
              >
                {message}
              </p>
            )}

            <button
              className="register-button"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Creating your account..."
                  : "Create account"}
              </span>

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-security-note">
            <ShieldCheck size={17} />
            <span>Your information is handled securely.</span>
          </div>

          <p className="login-link">
            Already have an account?{" "}
            <Link to="/login">Log in</Link>
          </p>

          <p className="auth-footer">
            By continuing, you agree to Homezy's terms and
            privacy policy.
          </p>
        </div>
      </section>

      {/* RIGHT SIDE — REGISTER ILLUSTRATION */}
      <section className="register-right">
        <RegisterCollage />

      
      </section>
    </main>
  );
}

export default Register;
