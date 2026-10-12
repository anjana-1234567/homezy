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
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

function ProviderServices() {
  const navigate = useNavigate();

  // ========================================
  // GET LOGGED-IN PROVIDER
  // ========================================

  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const providerName = user?.name || "Provider";

  const providerId = user?.id;

  // ========================================
  // STATES
  // ========================================

  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingServiceId, setEditingServiceId] =
    useState(null);

  const [formData, setFormData] = useState({
    category: "",
    serviceName: "",
    price: "",
    description: "",
  });

  // ========================================
  // SERVICE CATEGORIES
  // ========================================

  const serviceCategories = [
    "🏠 Home Maintenance",
    "🔧 Appliance Services",
    "💇 Beauty & Salon",
    "📦 Moving Services",
    "🧹 Deep Cleaning",
  ];

  // ========================================
  // SERVICES UNDER EACH CATEGORY
  // ========================================

  const servicesByCategory = {
    "🏠 Home Maintenance": [
      "Plumbing",
      "Electrical Repair",
      "Carpentry",
      "Painting",
      "Fan Installation",
      "Light Installation",
      "Water Tank Cleaning",
      "Water Filter Installation",
    ],

    "🔧 Appliance Services": [
      "AC Cleaning",
      "AC Repair",
      "Refrigerator Repair",
      "Washing Machine Repair",
      "TV Repair",
      "Microwave Repair",
      "Cooler Repair",
      "Water Purifier Repair",
    ],

    "💇 Beauty & Salon": [
      "Haircut",
      "Hair Styling",
      "Facial",
      "Hair Spa",
      "Manicure",
      "Pedicure",
      "Threading",
      "Waxing",
    ],

    "📦 Moving Services": [
      "Local Home Shifting",
      "Packing Service",
      "Unpacking Service",
      "Furniture Moving",
      "Office Shifting",
      "Loading & Unloading",
    ],

    "🧹 Deep Cleaning": [
      "Full Home Deep Cleaning",
      "Kitchen Deep Cleaning",
      "Bathroom Deep Cleaning",
      "Bedroom Deep Cleaning",
      "Sofa Cleaning",
      "Carpet Cleaning",
      "Window Cleaning",
      "Move-in / Move-out Cleaning",
    ],
  };

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ========================================
  // FETCH PROVIDER SERVICES
  // ========================================

  const fetchServices = async () => {
    if (!providerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/services/provider/${providerId}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to fetch services"
        );

        setLoading(false);
        return;
      }

      setServices(data.services || []);
    } catch (error) {
      console.error(
        "Fetch services error:",
        error
      );

      setMessage(
        "Unable to connect to server."
      );
    }

    setLoading(false);
  };

  // ========================================
  // LOAD SERVICES
  // ========================================

  useEffect(() => {
    fetchServices();
  }, [providerId]);

  // ========================================
  // FORM INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ========================================
  // CATEGORY CHANGE
  // ========================================

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;

    setFormData({
      ...formData,
      category: selectedCategory,
      serviceName: "",
    });
  };

  // ========================================
  // OPEN ADD FORM
  // ========================================

  const handleAddService = () => {
    setEditingServiceId(null);

    setFormData({
      category: "",
      serviceName: "",
      price: "",
      description: "",
    });

    setMessage("");

    setShowForm(true);
  };

  // ========================================
  // OPEN EDIT FORM
  // ========================================

  const handleEditService = (service) => {
    setEditingServiceId(service._id);

    setFormData({
      category: service.category || "",
      serviceName:
        service.serviceName || "",
      price:
        service.price !== undefined
          ? service.price
          : "",
      description:
        service.description || "",
    });

    setMessage("");

    setShowForm(true);
  };

  // ========================================
  // CANCEL FORM
  // ========================================

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingServiceId(null);

    setFormData({
      category: "",
      serviceName: "",
      price: "",
      description: "",
    });

    setMessage("");
  };

  // ========================================
  // SAVE SERVICE
  // ========================================

  const handleSubmitService = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!formData.category) {
      setMessage(
        "Please select a service category"
      );
      return;
    }

    if (!formData.serviceName.trim()) {
      setMessage(
        "Please select a service"
      );
      return;
    }

    if (
      formData.price === "" ||
      Number(formData.price) < 0
    ) {
      setMessage(
        "Please enter a valid price"
      );
      return;
    }

    try {
      // ========================================
      // EDIT SERVICE
      // ========================================

      if (editingServiceId) {
        const response = await fetch(
          `http://localhost:5000/api/services/${editingServiceId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              category:
                formData.category,
              serviceName:
                formData.serviceName.trim(),
              price: Number(
                formData.price
              ),
              description:
                formData.description.trim(),
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          setMessage(
            data.message ||
              "Failed to update service"
          );
          return;
        }

        setMessage(
          "Service updated successfully"
        );
      }

      // ========================================
      // ADD SERVICE
      // ========================================

      else {
        const response = await fetch(
          "http://localhost:5000/api/services",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              providerId: providerId,

              category:
                formData.category,

              serviceName:
                formData.serviceName.trim(),

              price: Number(
                formData.price
              ),

              description:
                formData.description.trim(),
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          setMessage(
            data.message ||
              "Failed to add service"
          );
          return;
        }

        setMessage(
          "Service added successfully"
        );
      }

      // Refresh services
      await fetchServices();

      // Close form
      setShowForm(false);

      setEditingServiceId(null);

      setFormData({
        category: "",
        serviceName: "",
        price: "",
        description: "",
      });
    } catch (error) {
      console.error(
        "Save service error:",
        error
      );

      setMessage(
        "Unable to connect to server."
      );
    }
  };

  // ========================================
  // DELETE SERVICE
  // ========================================

  const handleDeleteService = async (
    service
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.serviceName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/services/${service._id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to delete service"
        );
        return;
      }

      setMessage(
        "Service deleted successfully"
      );

      await fetchServices();
    } catch (error) {
      console.error(
        "Delete service error:",
        error
      );

      setMessage(
        "Unable to connect to server."
      );
    }
  };

  // ========================================
  // TOGGLE SERVICE STATUS
  // ========================================

  const handleToggleStatus = async (
    service
  ) => {
    const newStatus =
      service.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    try {
      const response = await fetch(
        `http://localhost:5000/api/services/${service._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to update status"
        );
        return;
      }

      setMessage(
        `Service ${
          newStatus === "ACTIVE"
            ? "activated"
            : "deactivated"
        } successfully`
      );

      await fetchServices();
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setMessage(
        "Unable to connect to server."
      );
    }
  };

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
              navigate("/provider")
            }
          >
            <Home size={20} />
            Dashboard
          </button>

          <button
            type="button"
            className="provider-menu-item active"
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
            className="provider-menu-item"
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
          MAIN CONTENT
      ==================================== */}

      <main className="provider-main">

        {/* HEADER */}

        <header className="provider-header">

          <div>

            <h1>
              My Services
            </h1>

            <p>
              Manage the services you provide
              to customers.
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
              {providerName
                .charAt(0)
                .toUpperCase()}
            </button>

          </div>

        </header>

        {/* ====================================
            MESSAGE
        ==================================== */}

        {message && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 15px",
              borderRadius: "8px",
              background:
                message.includes(
                  "successfully"
                )
                  ? "#ecfdf5"
                  : "#fef2f2",
              color:
                message.includes(
                  "successfully"
                )
                  ? "#047857"
                  : "#dc2626",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {message}
          </div>
        )}

        {/* ====================================
            ADD / EDIT FORM
        ==================================== */}

        {showForm && (
          <section className="provider-section">

            <div className="provider-section-heading">

              <div>

                <h2>
                  {editingServiceId
                    ? "Edit Service"
                    : "Add New Service"}
                </h2>

                <p>
                  Add the service details
                  customers will see.
                </p>

              </div>

            </div>

            <form
              onSubmit={
                handleSubmitService
              }
              style={{
                display: "grid",
                gap: "16px",
                maxWidth: "650px",
              }}
            >

              {/* CATEGORY */}

              <div className="input-group">

                <label>
                  Service Category
                </label>

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleCategoryChange
                  }
                  required
                >
                  <option value="">
                    Select Category
                  </option>

                  {serviceCategories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* ====================================
                  SERVICE NAME
              ==================================== */}

              <div className="input-group">

                <label>
                  Service Name
                </label>

                <select
                  name="serviceName"
                  value={
                    formData.serviceName
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={
                    !formData.category
                  }
                >

                  <option value="">
                    {!formData.category
                      ? "First select a category"
                      : "Select a service"}
                  </option>

                  {(
                    servicesByCategory[
                      formData.category
                    ] || []
                  ).map(
                    (serviceName) => (
                      <option
                        key={serviceName}
                        value={serviceName}
                      >
                        {serviceName}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* PRICE */}

              <div className="input-group">

                <label>
                  Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  placeholder="Enter service price"
                  min="0"
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div className="input-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Describe your service"
                  rows="4"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                ></textarea>

              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "5px",
                }}
              >

                <button
                  type="submit"
                  className="provider-add-service-button"
                >
                  <CheckCircle size={17} />

                  {editingServiceId
                    ? "Update Service"
                    : "Add Service"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleCancelForm
                  }
                  style={{
                    padding:
                      "10px 16px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    background:
                      "white",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </button>

              </div>

            </form>

          </section>
        )}

        {/* ====================================
            SERVICE SUMMARY
        ==================================== */}

        <section className="provider-section">

          <div className="provider-section-heading">

            <div>

              <h2>
                Your Services
              </h2>

              <p>
                Services currently offered
                by you
              </p>

            </div>

            {!showForm && (
              <button
                type="button"
                className="provider-add-service-button"
                onClick={
                  handleAddService
                }
              >
                <Plus size={17} />
                Add Service
              </button>
            )}

          </div>

          {/* ====================================
              LOADING
          ==================================== */}

          {loading ? (
            <div
              style={{
                padding: "30px 0",
                textAlign: "center",
                color: "#666",
              }}
            >
              Loading your services...
            </div>
          ) : services.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                border:
                  "1px dashed #d1d5db",
                borderRadius: "12px",
                color: "#666",
              }}
            >
              <Wrench
                size={35}
                style={{
                  marginBottom: "10px",
                }}
              />

              <h3>
                No services added yet
              </h3>

              <p>
                Add your first service so
                customers can find you.
              </p>
            </div>
          ) : (

            /* ====================================
                SERVICE CARDS
            ==================================== */

            <div className="provider-services-grid">

              {services.map(
                (service) => (

                  <div
                    className="provider-service-card"
                    key={service._id}
                  >

                    {/* ICON */}

                    <div className="provider-service-icon">
                      <Wrench size={26} />
                    </div>

                    {/* DETAILS */}

                    <div className="provider-service-details">

                      <div className="provider-service-title-row">

                        <h3>
                          {
                            service.serviceName
                          }
                        </h3>

                        {service.status ===
                        "ACTIVE" ? (
                          <span className="provider-active-badge">
                            <CheckCircle
                              size={13}
                            />
                            ACTIVE
                          </span>
                        ) : (
                          <span
                            className="provider-active-badge"
                            style={{
                              background:
                                "#fef2f2",
                              color:
                                "#dc2626",
                            }}
                          >
                            <XCircle
                              size={13}
                            />
                            INACTIVE
                          </span>
                        )}

                      </div>

                      <p>
                        {service.category}
                      </p>

                      <strong>
                        ₹{service.price}
                      </strong>

                      {service.description && (
                        <p
                          style={{
                            marginTop:
                              "6px",
                            fontSize:
                              "13px",
                          }}
                        >
                          {
                            service.description
                          }
                        </p>
                      )}

                    </div>

                    {/* ACTIONS */}

                    <div className="provider-service-actions">

                      <button
                        type="button"
                        title="Edit Service"
                        onClick={() =>
                          handleEditService(
                            service
                          )
                        }
                      >
                        <Pencil
                          size={17}
                        />
                      </button>

                      <button
                        type="button"
                        title={
                          service.status ===
                          "ACTIVE"
                            ? "Deactivate"
                            : "Activate"
                        }
                        onClick={() =>
                          handleToggleStatus(
                            service
                          )
                        }
                      >
                        {service.status ===
                        "ACTIVE" ? (
                          <XCircle
                            size={17}
                          />
                        ) : (
                          <CheckCircle
                            size={17}
                          />
                        )}
                      </button>

                      <button
                        type="button"
                        title="Delete Service"
                        onClick={() =>
                          handleDeleteService(
                            service
                          )
                        }
                      >
                        <Trash2
                          size={17}
                        />
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>
          )}

        </section>

        {/* ====================================
            SERVICE INFORMATION
        ==================================== */}

        <section className="provider-section">

          <div className="provider-info-box">

            <div className="provider-info-icon">
              <Wrench size={22} />
            </div>

            <div>

              <h3>
                Keep your services updated
              </h3>

              <p>
                Customers will see your active
                services, prices and availability
                when they search for
                professionals.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default ProviderServices;