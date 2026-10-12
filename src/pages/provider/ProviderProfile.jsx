import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Home,
  Wrench,
  ClipboardList,
  Briefcase,
  Wallet,
  User,
  LogOut,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  Save,
  Pencil,
  LoaderCircle,
  XCircle,
  Navigation,
  CheckCircle,
} from "lucide-react";

import {
  getSavedLocation,
  getCurrentLocation,
} from "../../utils/location";

import "./Provider.css";

function ProviderProfile() {
  const navigate = useNavigate();

  // ========================================
  // GET LOGGED-IN PROVIDER
  // ========================================

  const storedUser =
    localStorage.getItem("user");

  const loggedInUser = storedUser
    ? JSON.parse(storedUser)
    : null;

  const providerId =
    loggedInUser?._id ||
    loggedInUser?.id ||
    loggedInUser?.userId ||
    null;

  // ========================================
  // PROFILE STATE
  // ========================================

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const [
    serviceCategories,
    setServiceCategories,
  ] = useState([]);

  // ========================================
  // LOCATION STATE
  // ========================================

  const [
    location,
    setLocation,
  ] = useState(null);

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  const [
    locationMessage,
    setLocationMessage,
  ] = useState("");

  const [
    locationSuccess,
    setLocationSuccess,
  ] = useState(false);

  // ========================================
  // EDIT / LOADING STATE
  // ========================================

  const [isEditing, setIsEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // ========================================
  // FETCH PROFILE
  // ========================================

  useEffect(() => {
    fetchProfile();
  }, [providerId]);

  const fetchProfile =
    async () => {
      if (!providerId) {
        setError(
          "Provider login information not found."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `http://localhost:5000/api/auth/user/${providerId}`
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to load profile"
          );
        }

        const provider =
          data.user;

        setName(
          provider.name || ""
        );

        setEmail(
          provider.email || ""
        );

        setPhone(
          provider.phone || ""
        );

        setAddress(
          provider.address || ""
        );

        setExperience(
          provider.experience || ""
        );

        setServiceCategories(
          provider.serviceCategories ||
            []
        );

        // ========================================
        // SET PROVIDER LOCATION
        // ========================================

        if (
          provider.location?.latitude !==
            null &&
          provider.location?.longitude !==
            null &&
          provider.location?.latitude !==
            undefined &&
          provider.location?.longitude !==
            undefined
        ) {
          const providerLocation = {
            latitude:
              provider.location.latitude,

            longitude:
              provider.location.longitude,

            address:
              getSavedLocation(
                providerId
              )?.address ||
              "Saved Provider Location",

            updatedAt:
              provider.location.updatedAt ||
              null,
          };

          setLocation(
            providerLocation
          );
        } else {
          setLocation(null);
        }

        // ========================================
        // UPDATE LOCAL STORAGE
        // ========================================

        localStorage.setItem(
          "user",
          JSON.stringify(provider)
        );
      } catch (err) {
        console.error(
          "Fetch profile error:",
          err
        );

        // ----------------------------------------
        // Fallback
        // ----------------------------------------

        if (loggedInUser) {
          setName(
            loggedInUser.name || ""
          );

          setEmail(
            loggedInUser.email || ""
          );

          setPhone(
            loggedInUser.phone || ""
          );

          setAddress(
            loggedInUser.address ||
              ""
          );

          setExperience(
            loggedInUser.experience ||
              ""
          );

          setServiceCategories(
            loggedInUser.serviceCategories ||
              []
          );

          setLocation(
            getSavedLocation(
              providerId
            )
          );
        }

        setError(
          err.message ||
            "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

  // ========================================
  // CATEGORY HELPERS
  // ========================================

  const availableCategories = [
    "🏠 Home Maintenance",
    "🔧 Appliance Services",
    "💇 Beauty & Salon",
    "📦 Moving Services",
    "🧹 Deep Cleaning",
  ];

  const toggleCategory =
    (category) => {
      setServiceCategories(
        (previous) => {
          if (
            previous.includes(
              category
            )
          ) {
            return previous.filter(
              (item) =>
                item !== category
            );
          }

          return [
            ...previous,
            category,
          ];
        }
      );
    };

  // ========================================
  // SAVE PROFILE
  // ========================================

  const handleSave =
    async () => {
      if (!name.trim()) {
        alert(
          "Please enter your name."
        );

        return;
      }

      if (!phone.trim()) {
        alert(
          "Please enter your phone number."
        );

        return;
      }

      if (
        serviceCategories.length ===
        0
      ) {
        alert(
          "Please select at least one service category."
        );

        return;
      }

      try {
        setSaving(true);

        const response =
          await fetch(
            `http://localhost:5000/api/auth/user/${providerId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                name: name.trim(),

                phone: phone.trim(),

                address:
                  address.trim(),

                experience:
                  experience.trim(),

                serviceCategories,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to update profile"
          );
        }

        const updatedUser =
          data.user;

        // ----------------------------------------
        // Keep localStorage updated
        // ----------------------------------------

        localStorage.setItem(
          "user",
          JSON.stringify(
            updatedUser
          )
        );

        // ----------------------------------------
        // Update state
        // ----------------------------------------

        setName(
          updatedUser.name || ""
        );

        setEmail(
          updatedUser.email || ""
        );

        setPhone(
          updatedUser.phone || ""
        );

        setAddress(
          updatedUser.address ||
            ""
        );

        setExperience(
          updatedUser.experience ||
            ""
        );

        setServiceCategories(
          updatedUser.serviceCategories ||
            []
        );

        setIsEditing(false);

        alert(
          "Profile updated successfully!"
        );
      } catch (err) {
        console.error(
          "Save profile error:",
          err
        );

        alert(
          err.message ||
            "Unable to update profile."
        );
      } finally {
        setSaving(false);
      }
    };

  // ========================================
  // SET / UPDATE LOCATION
  // ========================================

  const handleUpdateLocation =
    async () => {
      if (!providerId) {
        alert(
          "Provider login information not found. Please login again."
        );

        return;
      }

      try {
        setLocationLoading(true);

        setLocationMessage(
          "Detecting your current location..."
        );

        setLocationSuccess(false);

        const locationData =
          await getCurrentLocation(
            providerId
          );

        setLocation(
          locationData
        );

        setLocationMessage(
          "Your provider location has been saved successfully."
        );

        setLocationSuccess(true);

        // ----------------------------------------
        // Refresh provider profile
        // ----------------------------------------

        const response =
          await fetch(
            `http://localhost:5000/api/auth/user/${providerId}`
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.success
        ) {
          localStorage.setItem(
            "user",
            JSON.stringify(
              data.user
            )
          );
        }
      } catch (error) {
        console.error(
          "Provider location error:",
          error
        );

        setLocationMessage(
          error.message ||
            "Unable to save your current location."
        );

        setLocationSuccess(false);
      } finally {
        setLocationLoading(false);
      }
    };

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout =
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate("/login");
    };

  // ========================================
  // CANCEL EDIT
  // ========================================

  const handleCancel =
    () => {
      fetchProfile();

      setIsEditing(false);
    };

  // ========================================
  // INITIAL
  // ========================================

  const providerInitial =
    name
      ?.charAt(0)
      ?.toUpperCase() || "P";

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="provider-layout">
        <aside className="provider-sidebar">
          <div className="provider-logo">
            <Home size={26} />
            <span>Homezy</span>
          </div>
        </aside>

        <main className="provider-main">
          <div className="provider-empty-state">
            <LoaderCircle
              size={40}
              className="loading-spinner"
            />

            <h3>
              Loading your profile...
            </h3>

            <p>
              Please wait while we
              fetch your information.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="provider-layout">

      {/* ====================================
          SIDEBAR
      ==================================== */}

      <aside className="provider-sidebar">

        <div className="provider-logo">
          <Home size={26} />
          <span>Homezy</span>
        </div>

        <nav className="provider-menu">

          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate(
                "/provider"
              )
            }
          >
            <Home size={20} />
            Dashboard
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate(
                "/provider/services"
              )
            }
          >
            <Wrench size={20} />
            My Services
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate(
                "/provider/requests"
              )
            }
          >
            <ClipboardList size={20} />
            Booking Requests
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate(
                "/provider/jobs"
              )
            }
          >
            <Briefcase size={20} />
            My Jobs
          </button>

          <button
            type="button"
            className="provider-menu-item"
            onClick={() =>
              navigate(
                "/provider/earnings"
              )
            }
          >
            <Wallet size={20} />
            Earnings
          </button>

          <button
            type="button"
            className="provider-menu-item active"
            onClick={() =>
              navigate(
                "/provider/profile"
              )
            }
          >
            <User size={20} />
            My Profile
          </button>

        </nav>

        <div className="provider-sidebar-bottom">

          <button
            type="button"
            className="provider-menu-item logout-item"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            Logout
          </button>

        </div>

      </aside>

      {/* ====================================
          MAIN
      ==================================== */}

      <main className="provider-main">

        {/* HEADER */}

        <header className="provider-header">

          <div>
            <h1>
              My Profile
            </h1>

            <p>
              Manage your provider information.
            </p>
          </div>

          <div className="provider-header-actions">

            <button
              type="button"
              className="provider-profile-circle"
              onClick={() =>
                navigate(
                  "/provider/profile"
                )
              }
            >
              {providerInitial}
            </button>

          </div>

        </header>

        {/* ERROR */}

        {error && (
          <div
            className="provider-info-box"
            style={{
              marginBottom:
                "20px",
            }}
          >

            <div className="provider-info-icon">
              <XCircle size={20} />
            </div>

            <div>
              <h3>
                Profile Loading Notice
              </h3>

              <p>
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ====================================
            PROFILE TOP
        ==================================== */}

        <section className="provider-profile-top">

          <div className="provider-profile-big-circle">
            {providerInitial}
          </div>

          <div className="provider-profile-main-info">

            <h2>
              {name}
            </h2>

            <p>
              Service Provider
            </p>

            <span>
              {serviceCategories.length >
              0
                ? `${serviceCategories.length} service ${
                    serviceCategories.length ===
                    1
                      ? "category"
                      : "categories"
                  }`
                : "No categories selected"}
            </span>

          </div>

          {!isEditing && (
            <button
              type="button"
              className="provider-edit-profile-button"
              onClick={() =>
                setIsEditing(
                  true
                )
              }
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          )}

        </section>

        {/* ====================================
            PERSONAL INFORMATION
        ==================================== */}

        <section className="provider-profile-section">

          <div className="provider-profile-section-title">

            <div>

              <h2>
                Personal Information
              </h2>

              <p>
                Your basic account information
              </p>

            </div>

          </div>

          <div className="provider-profile-form-grid">

            {/* NAME */}

            <div className="provider-form-group">

              <label>
                Full Name
              </label>

              <div className="provider-input-with-icon">

                <User size={17} />

                <input
                  type="text"
                  value={name}
                  disabled={
                    !isEditing
                  }
                  onChange={(event) =>
                    setName(
                      event.target
                        .value
                    )
                  }
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="provider-form-group">

              <label>
                Email
              </label>

              <div className="provider-input-with-icon">

                <Mail size={17} />

                <input
                  type="email"
                  value={email}
                  disabled
                />

              </div>

            </div>

            {/* PHONE */}

            <div className="provider-form-group">

              <label>
                Phone Number
              </label>

              <div className="provider-input-with-icon">

                <Phone size={17} />

                <input
                  type="text"
                  value={phone}
                  disabled={
                    !isEditing
                  }
                  onChange={(event) =>
                    setPhone(
                      event.target
                        .value
                    )
                  }
                />

              </div>

            </div>

            {/* ADDRESS */}

            <div className="provider-form-group">

              <label>
                Address
              </label>

              <div className="provider-input-with-icon">

                <MapPin size={17} />

                <input
                  type="text"
                  value={address}
                  disabled={
                    !isEditing
                  }
                  placeholder="Enter your service address"
                  onChange={(event) =>
                    setAddress(
                      event.target
                        .value
                    )
                  }
                />

              </div>

            </div>

          </div>

        </section>

        {/* ====================================
            PROVIDER LOCATION
        ==================================== */}

        <section className="provider-profile-section">

          <div className="provider-profile-section-title">

            <div>

              <h2>
                Service Location
              </h2>

              <p>
                Customers will use this location to find your distance and estimated travel time.
              </p>

            </div>

          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              padding: "18px",
              border:
                "1px solid #e5e7eb",
              borderRadius:
                "14px",
              background:
                "#f8fafc",
            }}
          >

            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius:
                  "12px",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                background:
                  location
                    ? "#dcfce7"
                    : "#fee2e2",
                color:
                  location
                    ? "#15803d"
                    : "#dc2626",
              }}
            >
              {location ? (
                <CheckCircle
                  size={24}
                />
              ) : (
                <MapPin
                  size={24}
                />
              )}
            </div>

            <div
              style={{
                flex: 1,
                minWidth:
                  "220px",
              }}
            >

              <h3
                style={{
                  margin:
                    "0 0 6px",
                  fontSize:
                    "16px",
                }}
              >
                {location
                  ? "Location is set"
                  : "Location not set"}
              </h3>

              <p
                style={{
                  margin: 0,
                  color:
                    "#64748b",
                  fontSize:
                    "14px",
                  lineHeight:
                    "1.5",
                }}
              >
                {location
                  ? location.address ||
                    "Your saved service location"
                  : "Set your service location so customers can see how far you are."}
              </p>

              {location &&
                location.latitude !==
                  undefined &&
                location.longitude !==
                  undefined && (
                  <p
                    style={{
                      margin:
                        "7px 0 0",
                      fontSize:
                        "12px",
                      color:
                        "#94a3b8",
                    }}
                  >
                    Coordinates:{" "}
                    {Number(
                      location.latitude
                    ).toFixed(
                      5
                    )}
                    ,{" "}
                    {Number(
                      location.longitude
                    ).toFixed(
                      5
                    )}
                  </p>
                )}

            </div>

            <button
              type="button"
              onClick={
                handleUpdateLocation
              }
              disabled={
                locationLoading
              }
              style={{
                border: "none",
                borderRadius:
                  "10px",
                padding:
                  "11px 16px",
                background:
                  "#2563eb",
                color: "#fff",
                fontWeight:
                  "600",
                cursor:
                  locationLoading
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems:
                  "center",
                gap: "8px",
                opacity:
                  locationLoading
                    ? 0.7
                    : 1,
              }}
            >

              {locationLoading ? (
                <LoaderCircle
                  size={17}
                  className="loading-spinner"
                />
              ) : (
                <Navigation
                  size={17}
                />
              )}

              {locationLoading
                ? "Getting Location..."
                : location
                ? "Update Location"
                : "Set My Location"}

            </button>

          </div>

          {locationMessage && (
            <p
              style={{
                margin:
                  "12px 0 0",
                color:
                  locationSuccess
                    ? "#15803d"
                    : "#dc2626",
                fontSize:
                  "14px",
                fontWeight:
                  "500",
              }}
            >
              {locationMessage}
            </p>
          )}

        </section>

        {/* ====================================
            PROFESSIONAL INFORMATION
        ==================================== */}

        <section className="provider-profile-section">

          <div className="provider-profile-section-title">

            <div>

              <h2>
                Professional Information
              </h2>

              <p>
                Information about your services
              </p>

            </div>

          </div>

          {/* SERVICE CATEGORIES */}

          <div className="provider-form-group">

            <label>
              Service Categories
            </label>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
                marginTop:
                  "8px",
              }}
            >

              {availableCategories.map(
                (category) => {
                  const selected =
                    serviceCategories.includes(
                      category
                    );

                  return (
                    <label
                      key={
                        category
                      }
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "10px",
                        padding:
                          "13px 15px",
                        border:
                          selected
                            ? "2px solid #2563eb"
                            : "1px solid #d1d5db",
                        borderRadius:
                          "10px",
                        cursor:
                          isEditing
                            ? "pointer"
                            : "default",
                        background:
                          selected
                            ? "#eff6ff"
                            : "#fff",
                        fontWeight:
                          selected
                            ? "600"
                            : "400",
                      }}
                    >

                      <input
                        type="checkbox"
                        checked={
                          selected
                        }
                        disabled={
                          !isEditing
                        }
                        onChange={() =>
                          toggleCategory(
                            category
                          )
                        }
                      />

                      <span>
                        {category}
                      </span>

                    </label>
                  );
                }
              )}

            </div>

          </div>

          {/* EXPERIENCE */}

          <div
            className="provider-profile-form-grid"
            style={{
              marginTop:
                "20px",
            }}
          >

            <div className="provider-form-group">

              <label>
                Experience
              </label>

              <div className="provider-input-with-icon">

                <Briefcase
                  size={17}
                />

                <input
                  type="text"
                  value={
                    experience
                  }
                  disabled={
                    !isEditing
                  }
                  placeholder="Example: 3 years"
                  onChange={(event) =>
                    setExperience(
                      event.target
                        .value
                    )
                  }
                />

              </div>

            </div>

          </div>

        </section>

        {/* ====================================
            INFO
        ==================================== */}

        <div className="provider-info-box">

          <div className="provider-info-icon">
            <BriefcaseBusiness
              size={20}
            />
          </div>

          <div>

            <h3>
              Manage Individual Services
            </h3>

            <p>
              Your categories are shown
              here. To add or change
              individual services such as
              AC Cleaning, TV Repair or
              Haircut, use My Services.
            </p>

          </div>

        </div>

        {/* ====================================
            SAVE / CANCEL
        ==================================== */}

        {isEditing && (
          <div className="provider-profile-actions">

            <button
              type="button"
              className="provider-cancel-profile-button"
              onClick={
                handleCancel
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="provider-save-profile-button"
              onClick={
                handleSave
              }
              disabled={saving}
            >

              {saving ? (
                <LoaderCircle
                  size={17}
                  className="loading-spinner"
                />
              ) : (
                <Save size={17} />
              )}

              {saving
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>
        )}

      </main>

    </div>
  );
}

export default ProviderProfile;