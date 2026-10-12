
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Eye,
  EyeOff,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import AuthCollage from "../components/AuthCollage";
import { API_ENDPOINTS } from "../config/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.AUTH}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "provider") {
        navigate("/provider");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/customer");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        "Unable to connect. Please check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hz-auth-page">
      <div className="hz-topbar">
        <div>
          <Mail size={14} />
          <span>hello@homezy.com</span>
        </div>

        <div>
          <Phone size={14} />
          <span>+91 98765 43210</span>
        </div>

        <div className="hz-location">
          <MapPin size={14} />
          <span>Hyderabad, Telangana</span>
        </div>
      </div>

      <header className="hz-navbar">
        <Link to="/login" className="hz-brand">
          <span className="hz-brand-icon">
            <Home size={20} />
          </span>
          Homezy
        </Link>

        <nav className="hz-nav-links">
          <Link to="/login" className="active">
            Home
          </Link>
          <Link to="/login">Services</Link>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </nav>

        <Link to="/register" className="hz-book-button">
          BOOK A PRO
        </Link>
      </header>

 <section className="hz-auth-hero">
  <h1>
    <span className="white-text">YOUR HOME,</span>
    <br />
    <span>FLAWLESSLY</span>{" "}
    <span className="white-text">KEPT.</span>
  </h1>
</section>

      <main className="hz-auth-main">
        <div className="hz-auth-illustration">
          <AuthCollage />
        </div>

        <section className="hz-login-card">
          <div className="hz-auth-tabs">
            <button type="button" className="selected">
              LOG IN
            </button>
            <Link to="/register">REGISTER</Link>
          </div>

          <h2>Welcome</h2>
          <p className="hz-login-subtitle">
            Sign in to your account
          </p>

          <form onSubmit={handleLogin}>
            <label className="hz-login-input">
              <Mail size={18} />

              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </label>

            <label className="hz-login-input">
              <span className="hz-lock">🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="hz-eye"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </label>

            <div className="hz-login-options">
              <label>
                <input type="checkbox" />
                Remember me
              </label>

              <Link to="/login">Forgot password?</Link>
            </div>

            {message && (
              <p
                className={
                  message.includes("successful")
                    ? "hz-success"
                    : "hz-error"
                }
                role="status"
              >
                {message}
              </p>
            )}

            <button
              className="hz-submit-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "PLEASE WAIT..." : "LOG IN"}
            </button>
          </form>

          <p className="hz-register-prompt">
            DON’T HAVE AN ACCOUNT?{" "}
            <Link to="/register">REGISTER</Link>
          </p>

          <div className="hz-divider">
            <span>Or sign in with</span>
          </div>

          <div className="hz-social-buttons">
            <button type="button" aria-label="Google sign in">
              G
            </button>
            <button type="button" aria-label="Apple sign in">
              A
            </button>
            <button type="button" aria-label="Facebook sign in">
              f
            </button>
          </div>
        </section>
      </main>

      <footer className="hz-footer-contact-only" id="contact">
        <div>
          <strong>Get in touch</strong>
          <a href="mailto:hello@homezy.com">
            hello@homezy.com
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Login;
