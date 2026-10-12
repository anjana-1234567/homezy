import { useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Pencil,
  Save,
  LockKeyhole,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminProfile() {
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: localStorage.getItem("adminName") || "Homezy Admin",
    email: localStorage.getItem("adminEmail") || "admin@homezy.com",
    phone: localStorage.getItem("adminPhone") || "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [message, setMessage] = useState("");

  const handleProfileSave = () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      setMessage("Name and email are required.");
      return;
    }

    localStorage.setItem("adminName", profile.name.trim());
    localStorage.setItem("adminEmail", profile.email.trim());
    localStorage.setItem("adminPhone", profile.phone.trim());

    setEditing(false);
    setMessage("Profile details saved on this browser.");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (!passwords.current || !passwords.newPassword || !passwords.confirm) {
      setMessage("Please fill in all password fields.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setMessage("New password must be at least 8 characters.");
      return;
    }

    if (passwords.newPassword !== passwords.confirm) {
      setMessage("New passwords do not match.");
      return;
    }

    setMessage(
      "Password change needs to be connected to your backend before it can be completed."
    );
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #dbe2ea",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "#fff",
    color: "#172033",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "8px",
  };

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e8edf4",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
        color: "#172033",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <button
          onClick={() => navigate("/admin")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            background: "transparent",
            color: "#64748b",
            cursor: "pointer",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>
            Admin Profile
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Manage your Homezy administrator information and security.
          </p>
        </div>

        {message && (
          <div
            role="status"
            style={{
              background: "#eef6ff",
              border: "1px solid #c9e0ff",
              color: "#2459a9",
              padding: "13px 16px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(250px, 0.8fr) minmax(320px, 1.6fr)",
            gap: "22px",
            alignItems: "start",
          }}
        >
          <div style={cardStyle}>
            <div
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #5b5ce2, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "32px",
                fontWeight: 700,
                marginBottom: "18px",
              }}
            >
              {(profile.name.trim()[0] || "A").toUpperCase()}
            </div>

            <h2 style={{ fontSize: "21px", margin: "0 0 7px" }}>
              {profile.name}
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
                overflowWrap: "anywhere",
                margin: "0 0 18px",
              }}
            >
              {profile.email}
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                background: "#eef2ff",
                color: "#4f46e5",
                borderRadius: "20px",
                padding: "8px 12px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={15} />
              ADMINISTRATOR
            </div>

            <div
              style={{
                borderTop: "1px solid #edf0f5",
                marginTop: "24px",
                paddingTop: "18px",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  margin: "0 0 6px",
                }}
              >
                ACCOUNT ROLE
              </p>
              <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
                Homezy Admin
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: "22px" }}>
            <section style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "18px", margin: "0 0 6px" }}>
                    Personal Information
                  </h2>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      margin: 0,
                    }}
                  >
                    Update your administrator details.
                  </p>
                </div>

                {!editing && (
                  <button
                    onClick={() => {
                      setMessage("");
                      setEditing(true);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      background: "#eef2ff",
                      color: "#4f46e5",
                      border: "none",
                      borderRadius: "9px",
                      padding: "10px 13px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <Pencil size={15} />
                    Edit Profile
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    <UserRound
                      size={14}
                      style={{ verticalAlign: "middle", marginRight: "6px" }}
                    />
                    Full Name
                  </label>
                  <input
                    style={inputStyle}
                    value={profile.name}
                    disabled={!editing}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    <Mail
                      size={14}
                      style={{ verticalAlign: "middle", marginRight: "6px" }}
                    />
                    Email Address
                  </label>
                  <input
                    style={inputStyle}
                    type="email"
                    value={profile.email}
                    disabled={!editing}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    <Phone
                      size={14}
                      style={{ verticalAlign: "middle", marginRight: "6px" }}
                    />
                    Phone Number
                  </label>
                  <input
                    style={inputStyle}
                    type="tel"
                    value={profile.phone}
                    disabled={!editing}
                    placeholder="Enter phone number"
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              {editing && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "22px",
                  }}
                >
                  <button
                    onClick={handleProfileSave}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      background: "#4f46e5",
                      color: "#fff",
                      border: "none",
                      borderRadius: "9px",
                      padding: "12px 17px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <Save size={16} />
                    Save Changes
                  </button>

                  <button
                    onClick={() => {
                      setProfile({
                        name: localStorage.getItem("adminName") || "Homezy Admin",
                        email:
                          localStorage.getItem("adminEmail") ||
                          "admin@homezy.com",
                        phone: localStorage.getItem("adminPhone") || "",
                      });
                      setEditing(false);
                      setMessage("");
                    }}
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "none",
                      borderRadius: "9px",
                      padding: "12px 17px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </section>

            <section style={cardStyle}>
              <div style={{ marginBottom: "22px" }}>
                <h2
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    fontSize: "18px",
                    margin: "0 0 6px",
                  }}
                >
                  <LockKeyhole size={19} color="#6366f1" />
                  Account Security
                </h2>
                <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                  Password changes require backend verification.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div style={{ marginBottom: "17px" }}>
                  <label style={labelStyle}>Current Password</label>
                  <input
                    style={inputStyle}
                    type="password"
                    autoComplete="current-password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    placeholder="Enter current password"
                  />
                </div>

                <div style={{ marginBottom: "17px" }}>
                  <label style={labelStyle}>New Password</label>
                  <input
                    style={inputStyle}
                    type="password"
                    autoComplete="new-password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="At least 8 characters"
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input
                    style={inputStyle}
                    type="password"
                    autoComplete="new-password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    placeholder="Re-enter new password"
                  />
                </div>

                <button
                  type="submit"
                  onClick={() => {
                    setMessage("");
                    setShowPassword(true);
                  }}
                  style={{
                    background: "#172554",
                    color: "#fff",
                    border: "none",
                    borderRadius: "9px",
                    padding: "12px 17px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Change Password
                </button>

                {showPassword && (
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      marginTop: "12px",
                    }}
                  >
                    This form does not change your actual login password yet.
                    Backend verification must be implemented first.
                  </p>
                )}
              </form>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          body { margin: 0; }
        }
        input:disabled {
          background: #f8fafc !important;
          color: #475569 !important;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}