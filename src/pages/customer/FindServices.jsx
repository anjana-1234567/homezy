
import {
  Search,
  Bell,
  MapPin,
  Star,
  SlidersHorizontal,
  Navigation,
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  Paintbrush,
  Settings,
  Scissors,
  Truck,
  ChevronRight,
  ArrowLeft,
  Droplets,
  Snowflake,
  Bug,
  Shirt,
  ShieldCheck,
  Fan,
  Refrigerator,
  WashingMachine,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  getSavedLocation,
  getCurrentLocation,
} from "../../utils/location";

// Leaflet marker icons
const customerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const providerIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -35],
});

// Map controller
function MapController({ selectedProvider, location }) {
  const map = useMap();

  useEffect(() => {
    const providerLocation = selectedProvider?.providerId?.location;

    if (
      providerLocation?.latitude != null &&
      providerLocation?.longitude != null
    ) {
      map.flyTo(
        [
          Number(providerLocation.latitude),
          Number(providerLocation.longitude),
        ],
        15,
        { duration: 1.2 }
      );
      return;
    }

    if (
      location?.latitude != null &&
      location?.longitude != null
    ) {
      map.setView(
        [
          Number(location.latitude),
          Number(location.longitude),
        ],
        13
      );
    }
  }, [selectedProvider, location, map]);

  return null;
}

function FindServices() {
  const navigate = useNavigate();
  const mapSectionRef = useRef(null);

  // Logged-in user
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const userId =
    user?._id || user?.id || user?.userId || null;

  // Location
  const [location, setLocation] = useState(() =>
    userId ? getSavedLocation(userId) : null
  );

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const handleCurrentLocation = async () => {
    try {
      if (!userId) {
        setLocationMessage("Please login first.");
        return;
      }

      setLocationLoading(true);
      setLocationMessage("Detecting your current location...");

      const locationData = await getCurrentLocation(userId);

      setLocation(locationData);
      setLocationMessage("Current location saved successfully.");
    } catch (error) {
      console.error("Location error:", error);
      setLocationMessage(
        error.message || "Unable to get your location."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Service categories
  const categories = [
    {
      name: "Home Maintenance",
      description:
        "Plumbing, electrical, carpentry and painting",
    },
    {
      name: "Appliance Services",
      description:
        "AC, TV, refrigerator, washing machine and more",
    },
    {
      name: "Beauty & Salon",
      description:
        "Hair, facial, makeup and personal care",
    },
    {
      name: "Moving Services",
      description:
        "Packing, moving and home shifting",
    },
    {
      name: "Deep Cleaning",
      description:
        "Home, bathroom, kitchen and appliance cleaning",
    },
  ];

  // States
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [providerDistances, setProviderDistances] = useState({});
  const [providerReviews, setProviderReviews] = useState({});
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState("");

  const [selectedMapProvider, setSelectedMapProvider] =
    useState(null);

  // Fetch services
  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      setServicesError("");

      const response = await fetch(
        "http://localhost:5000/api/services"
      );

      const data = await response.json();

      if (!response.ok) {
        setServicesError(
          data.message || "Failed to load services"
        );
        return;
      }

      setServices(data.services || []);
    } catch (error) {
      console.error("Fetch services error:", error);
      setServicesError(
        "Unable to connect to Homezy server."
      );
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Load saved location
  useEffect(() => {
    if (!userId) return;

    const savedLocation = getSavedLocation(userId);

    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, [userId]);

  // Normalize category
  const normalizeCategory = (category) => {
    if (!category) return "";

    return category
      .replace(/^[^\p{L}\p{N}]+/u, "")
      .trim();
  };

  // Category icons
  const getCategoryIcon = (categoryName) => {
    const category = categoryName.toLowerCase();

    if (category.includes("maintenance")) {
      return <Wrench size={28} />;
    }
    if (category.includes("appliance")) {
      return <Settings size={28} />;
    }
    if (category.includes("beauty")) {
      return <Scissors size={28} />;
    }
    if (category.includes("moving")) {
      return <Truck size={28} />;
    }
    if (category.includes("cleaning")) {
      return <Sparkles size={28} />;
    }

    return <Wrench size={28} />;
  };

  // Specific service icons
  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();

    if (name.includes("ac") || name.includes("air conditioner")) {
      return <Snowflake size={25} />;
    }
    if (name.includes("fan")) {
      return <Fan size={25} />;
    }
    if (
      name.includes("refrigerator") ||
      name.includes("fridge")
    ) {
      return <Refrigerator size={25} />;
    }
    if (name.includes("washing machine")) {
      return <WashingMachine size={25} />;
    }
    if (
      name.includes("water") ||
      name.includes("ro") ||
      name.includes("purifier")
    ) {
      return <Droplets size={25} />;
    }
    if (
      name.includes("plumb") ||
      name.includes("tap") ||
      name.includes("pipe") ||
      name.includes("basin") ||
      name.includes("shower") ||
      name.includes("toilet")
    ) {
      return <Droplets size={25} />;
    }
    if (
      name.includes("electrical") ||
      name.includes("switch") ||
      name.includes("socket") ||
      name.includes("wiring") ||
      name.includes("mcb") ||
      name.includes("fuse") ||
      name.includes("light")
    ) {
      return <Zap size={25} />;
    }
    if (
      name.includes("carpentry") ||
      name.includes("furniture") ||
      name.includes("door") ||
      name.includes("wardrobe") ||
      name.includes("drawer") ||
      name.includes("shelf")
    ) {
      return <Hammer size={25} />;
    }
    if (
      name.includes("paint") ||
      name.includes("wall") ||
      name.includes("waterproof")
    ) {
      return <Paintbrush size={25} />;
    }
    if (
      name.includes("beauty") ||
      name.includes("hair") ||
      name.includes("facial") ||
      name.includes("makeup") ||
      name.includes("wax") ||
      name.includes("manicure") ||
      name.includes("pedicure") ||
      name.includes("thread")
    ) {
      return <Scissors size={25} />;
    }
    if (name.includes("clean")) {
      return <Sparkles size={25} />;
    }
    if (
      name.includes("pest") ||
      name.includes("cockroach") ||
      name.includes("termite") ||
      name.includes("mosquito") ||
      name.includes("rodent")
    ) {
      return <Bug size={25} />;
    }
    if (
      name.includes("laundry") ||
      name.includes("iron") ||
      name.includes("cloth") ||
      name.includes("dry clean")
    ) {
      return <Shirt size={25} />;
    }
    if (
      name.includes("shift") ||
      name.includes("pack") ||
      name.includes("move")
    ) {
      return <Truck size={25} />;
    }

    return <Wrench size={25} />;
  };

  // Filter categories
  const filteredCategories = categories.filter(
    (category) =>
      category.name
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      category.description
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

  // Services in selected category
  const categoryServices = selectedCategory
    ? services.filter(
        (service) =>
          normalizeCategory(service.category) ===
          selectedCategory.name
      )
    : [];

  // Filter services
  const filteredServices = categoryServices.filter(
    (service) =>
      service.serviceName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      service.description
        ?.toLowerCase()
        .includes(searchText.toLowerCase())
  );

  // Select category
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedService(null);
    setSelectedMapProvider(null);
    setSearchText("");
    setProviderDistances({});
  };

  // Select service
  const handleServiceClick = (service) => {
    setSelectedService(service);
    setSelectedMapProvider(null);
    setProviderDistances({});
    setDistanceError("");
  };

  // Back button
  const handleBack = () => {
    if (selectedService) {
      setSelectedService(null);
      setSelectedMapProvider(null);
      setProviderDistances({});
    } else {
      setSelectedCategory(null);
    }

    setSearchText("");
    setDistanceError("");
  };

  // Matching providers
  const matchingProviders = selectedService
    ? services.filter(
        (service) =>
          service.serviceName === selectedService.serviceName &&
          normalizeCategory(service.category) ===
            normalizeCategory(selectedService.category)
      )
    : [];

  // Provider IDs for reviews
  const providerIdsForReviews = [
    ...new Set(
      matchingProviders
        .map(
          (service) =>
            service.providerId?._id ||
            service.providerId?.id
        )
        .filter(Boolean)
        .map(String)
    ),
  ].sort();

  const providerIdsKey = providerIdsForReviews.join(",");

  // Fetch provider road distances
  useEffect(() => {
    let cancelled = false;

    const loadProviderDistances = async () => {
      if (
        !selectedService ||
        location?.latitude == null ||
        location?.longitude == null
      ) {
        setProviderDistances({});
        return;
      }

      const providerIds = matchingProviders
        .map(
          (service) =>
            service.providerId?._id ||
            service.providerId?.id
        )
        .filter(Boolean);

      if (providerIds.length === 0) {
        setProviderDistances({});
        return;
      }

      try {
        setDistanceLoading(true);
        setDistanceError("");

        const uniqueProviderIds = [
          ...new Set(providerIds),
        ];

        const query = new URLSearchParams({
          customerId: userId || "",
          providerIds: uniqueProviderIds.join(","),
        });

        const response = await fetch(
          `http://localhost:5000/api/location/distances?${query.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to calculate provider distances."
          );
        }

        if (!cancelled) {
          setProviderDistances(data.distances || {});
        }
      } catch (error) {
        console.error("Provider distance error:", error);

        if (!cancelled) {
          setProviderDistances({});
          setDistanceError(
            error.message ||
              "Unable to calculate road distance."
          );
        }
      } finally {
        if (!cancelled) {
          setDistanceLoading(false);
        }
      }
    };

    loadProviderDistances();

    return () => {
      cancelled = true;
    };
  }, [
    selectedService,
    location,
    userId,
    providerIdsKey,
  ]);

  // Fetch provider ratings and reviews
  useEffect(() => {
    let cancelled = false;

    const loadProviderReviews = async () => {
      if (!providerIdsKey) {
        setProviderReviews({});
        return;
      }

      try {
        const providerIds = providerIdsKey.split(",");

        const results = await Promise.all(
          providerIds.map(async (providerId) => {
            const response = await fetch(
              `http://localhost:5000/api/reviews/provider/${providerId}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
              throw new Error(
                data.message ||
                  "Unable to load provider reviews"
              );
            }

            return [providerId, data];
          })
        );

        if (!cancelled) {
          setProviderReviews(
            Object.fromEntries(results)
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Provider reviews error:", error);
        }
      }
    };

    loadProviderReviews();

    return () => {
      cancelled = true;
    };
  }, [providerIdsKey]);

  // Sort providers by road distance
  const sortedProviders = [...matchingProviders].sort(
    (a, b) => {
      const aId =
        a.providerId?._id || a.providerId?.id;

      const bId =
        b.providerId?._id || b.providerId?.id;

      const aDistance =
        providerDistances[aId]?.distanceKm;

      const bDistance =
        providerDistances[bId]?.distanceKm;

      if (
        typeof aDistance !== "number" &&
        typeof bDistance !== "number"
      ) {
        return 0;
      }

      if (typeof aDistance !== "number") return 1;
      if (typeof bDistance !== "number") return -1;

      return aDistance - bDistance;
    }
  );

  // Format distance
  const formatDistance = (distanceKm) => {
    if (typeof distanceKm !== "number") return null;

    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }

    return `${distanceKm.toFixed(1)} km`;
  };

  // Format travel time
  const formatDuration = (durationMinutes) => {
    if (typeof durationMinutes !== "number") return null;
    if (durationMinutes < 1) return "< 1 min";

    if (durationMinutes < 60) {
      return `~${Math.round(durationMinutes)} min`;
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = Math.round(durationMinutes % 60);

    if (minutes === 0) return `~${hours} hr`;

    return `~${hours} hr ${minutes} min`;
  };

  // Open provider on map
  const handleOpenMap = (provider) => {
    const providerLocation = provider.providerId?.location;

    if (
      providerLocation?.latitude == null ||
      providerLocation?.longitude == null
    ) {
      setLocationMessage(
        "Provider has not set a service location yet."
      );
      return;
    }

    setSelectedMapProvider(provider);

    setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  // Show all providers on map
  const handleShowAllProviders = () => {
    setSelectedMapProvider(null);

    setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  // Book service
  const handleBookNow = (provider) => {
    navigate("/customer/review", {
      state: {
        service: {
          id: provider._id,
          name: provider.serviceName,
          category: normalizeCategory(provider.category),
          price: provider.price,
          description: provider.description,
        },

        provider: {
          id: provider.providerId?._id,
          name: provider.providerId?.name || "Provider",
          phone: provider.providerId?.phone || "",
          address: provider.providerId?.address || "",
          location: provider.providerId?.location || null,
        },

        customerLocation: location || null,
      },
    });
  };

  // Map center
  const mapCenter =
    location?.latitude != null &&
    location?.longitude != null
      ? [
          Number(location.latitude),
          Number(location.longitude),
        ]
      : [17.385, 78.4867];

  return (
    <div className="find-services-page">
      {/* No sidebar here: CustomerLayout provides it */}

      <header className="customer-header">
        <div>
          <h1>Find Services</h1>
          <p>Find trusted professionals near you</p>
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
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </button>
        </div>
      </header>

      {/* Location */}
      <div className="location-bar">
        <MapPin size={20} />

        <div>
          <span>Searching near</span>
          <strong>
            {location?.address || "Location not set"}
          </strong>

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
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            whiteSpace: "nowrap",
            cursor: locationLoading ? "not-allowed" : "pointer",
            opacity: locationLoading ? 0.7 : 1,
          }}
        >
          <Navigation size={16} />
          {locationLoading
            ? "Detecting..."
            : location
            ? "Change"
            : "Use Current Location"}
        </button>
      </div>

      {/* Search */}
      <div className="find-search">
        <Search size={21} />

        <input
          type="text"
          placeholder={
            selectedCategory
              ? "Search for a service..."
              : "Search for a category..."
          }
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        <button type="button" className="filter-button">
          <SlidersHorizontal size={18} />
          Filters
        </button>
      </div>

      {/* Loading */}
      {servicesLoading && (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#666",
          }}
        >
          Loading available services...
        </div>
      )}

      {/* Error */}
      {!servicesLoading && servicesError && (
        <div
          style={{
            padding: "20px",
            marginTop: "20px",
            borderRadius: "10px",
            background: "#fef2f2",
            color: "#dc2626",
          }}
        >
          {servicesError}
        </div>
      )}

      {/* Step 1: Categories */}
      {!servicesLoading && !selectedCategory && (
        <>
          <div className="service-page-title">
            <div>
              <h2>What service do you need?</h2>
              <p>Choose a category to explore available services</p>
            </div>
          </div>

          <div className="category-grid">
            {filteredCategories.map((category) => {
              const count = services.filter(
                (service) =>
                  normalizeCategory(service.category) ===
                  category.name
              ).length;

              return (
                <div
                  className="category-card"
                  key={category.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCategoryClick(category)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      handleCategoryClick(category);
                    }
                  }}
                >
                  <div className="category-icon">
                    {getCategoryIcon(category.name)}
                  </div>

                  <div className="category-content">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <small>
                      {count} active{" "}
                      {count === 1 ? "service" : "services"}
                    </small>
                  </div>

                  <ChevronRight
                    size={19}
                    className="category-arrow"
                  />
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Step 2: Services */}
      {!servicesLoading &&
        selectedCategory &&
        !selectedService && (
          <>
            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              <ArrowLeft size={18} />
              All Categories
            </button>

            <div className="service-page-title">
              <div className="selected-category-title">
                <div className="small-category-icon">
                  {getCategoryIcon(selectedCategory.name)}
                </div>

                <div>
                  <h2>{selectedCategory.name}</h2>
                  <p>Select the exact service you need</p>
                </div>
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <div
                className="no-providers"
                style={{ marginTop: "20px" }}
              >
                <Search size={35} />
                <h3>No services available</h3>
                <p>
                  Providers have not added services in this
                  category yet.
                </p>
              </div>
            ) : (
              <div className="specific-service-grid">
                {filteredServices.map((service) => {
                  const providerCount = services.filter(
                    (item) =>
                      item.serviceName === service.serviceName &&
                      normalizeCategory(item.category) ===
                        normalizeCategory(service.category)
                  ).length;

                  return (
                    <div
                      className="specific-service-card"
                      key={service._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleServiceClick(service)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          handleServiceClick(service);
                        }
                      }}
                    >
                      <div className="specific-service-icon">
                        {getServiceIcon(service.serviceName)}
                      </div>

                      <div className="specific-service-info">
                        <h3>{service.serviceName}</h3>
                        <p>
                          {service.description ||
                            "Professional service from a trusted provider"}
                        </p>

                        <div className="service-card-bottom">
                          <strong>From ₹{service.price}</strong>
                          <span>
                            {providerCount}{" "}
                            {providerCount === 1
                              ? "provider"
                              : "providers"}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        size={19}
                        className="specific-arrow"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      {/* Step 3: Providers */}
      {!servicesLoading && selectedService && (
        <>
          <button
            type="button"
            className="back-button"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            Back to {selectedCategory.name}
          </button>

          <div className="service-selected-header">
            <div>
              <div className="breadcrumb-text">
                {selectedCategory.name}
                <ChevronRight size={14} />
                {selectedService.serviceName}
              </div>

              <h2>{selectedService.serviceName}</h2>
              <p>Choose a trusted professional near you</p>
            </div>

            <div className="selected-service-price">
              <span>Starting from</span>
              <strong>
                ₹
                {matchingProviders.length
                  ? Math.min(
                      ...matchingProviders.map((item) =>
                        Number(item.price)
                      )
                    )
                  : 0}
              </strong>
            </div>
          </div>

          <div className="find-results-header">
            <div>
              <h2>Available Professionals</h2>
              <p>
                {matchingProviders.length} professionals available
              </p>
            </div>

            <button type="button" className="sort-button">
              Nearest
              <ChevronRight size={16} />
            </button>
          </div>

          {!location?.latitude ||
          !location?.longitude ? (
            <div
              style={{
                marginBottom: "18px",
                padding: "14px 16px",
                borderRadius: "10px",
                background: "#fff7ed",
                color: "#c2410c",
              }}
            >
              <MapPin size={18} />
              Set your location to see real road distance and
              estimated travel time.
            </div>
          ) : null}

          {distanceLoading && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "#eff6ff",
                color: "#2563eb",
              }}
            >
              Calculating real road distance and travel time...
            </div>
          )}

          {distanceError && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "#fef2f2",
                color: "#dc2626",
              }}
            >
              {distanceError}
            </div>
          )}

          <div className="find-services-content">
            {/* Provider list */}
            <div className="provider-list">
              {sortedProviders.length === 0 ? (
                <div className="no-providers">
                  <Search size={35} />
                  <h3>No providers available</h3>
                  <p>
                    We couldn't find a provider for this service.
                  </p>
                </div>
              ) : (
                sortedProviders.map((provider) => {
                  const providerUser = provider.providerId;

                  const providerId =
                    providerUser?._id || providerUser?.id;

                  const routeInfo = providerDistances[providerId];

                  const reviewData = providerReviews[providerId];
                  const reviewCount = reviewData?.totalReviews || 0;

                  return (
                    <div
                      className="provider-card"
                      key={provider._id}
                    >
                      <div className="provider-avatar">
                        {providerUser?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "P"}
                      </div>

                      <div className="provider-info">
                        <div className="provider-name-row">
                          <h3>
                            {providerUser?.name ||
                              "Homezy Provider"}
                          </h3>

                          {provider.status === "ACTIVE" && (
                            <span className="available-badge">
                              Available
                            </span>
                          )}
                        </div>

                        <p className="provider-service">
                          {provider.serviceName}
                        </p>

                        <div className="provider-details">
                          <span>
                            <Star
                              size={15}
                              fill="currentColor"
                            />
                            {reviewCount > 0
                              ? Number(
                                  reviewData.averageRating
                                ).toFixed(1)
                              : "New"}
                            <small>
                              ({reviewCount}{" "}
                              {reviewCount === 1
                                ? "review"
                                : "reviews"}
                              )
                            </small>
                          </span>

                          <span>
                            <MapPin size={15} />
                            {providerUser?.address ||
                              "Address not provided"}
                          </span>

                          <span>
                            <ShieldCheck size={15} />
                            {providerUser?.experience ||
                              "Verified Provider"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            marginTop: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          {routeInfo ? (
                            <>
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  fontWeight: 600,
                                }}
                              >
                                <Navigation size={15} />
                                {formatDistance(
                                  routeInfo.distanceKm
                                )}
                              </span>

                              <span style={{ color: "#64748b" }}>
                                •
                              </span>

                              <span style={{ color: "#475569" }}>
                                {formatDuration(
                                  routeInfo.durationMinutes
                                )}
                              </span>
                            </>
                          ) : (
                            <span
                              style={{
                                color: "#94a3b8",
                                fontSize: "13px",
                              }}
                            >
                              Road distance unavailable
                            </span>
                          )}
                        </div>

                        <div className="provider-bottom">
                          <strong>₹{provider.price}</strong>

                          <div className="provider-actions">
                            <button
                              type="button"
                              className="map-button"
                              onClick={() =>
                                handleOpenMap(provider)
                              }
                            >
                              <Navigation size={15} />
                              Map
                            </button>

                            <button
                              type="button"
                              className="book-button"
                              onClick={() =>
                                handleBookNow(provider)
                              }
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Interactive map */}
            <div
              className="map-container"
              ref={mapSectionRef}
            >
              <div className="map-header">
                <div>
                  <h3>Nearby Providers</h3>
                  <p>{selectedService.serviceName} near you</p>
                </div>

                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  title="Use my current location"
                >
                  <Navigation size={17} />
                </button>
              </div>

              <div
                style={{
                  height: "420px",
                  width: "100%",
                  overflow: "hidden",
                  borderRadius: "12px",
                }}
              >
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  scrollWheelZoom={true}
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapController
                    selectedProvider={selectedMapProvider}
                    location={location}
                  />

                  {/* Customer marker */}
                  {location?.latitude != null &&
                    location?.longitude != null && (
                      <Marker
                        position={[
                          Number(location.latitude),
                          Number(location.longitude),
                        ]}
                        icon={customerIcon}
                      >
                        <Popup>
                          <strong>Your Location</strong>
                          <br />
                          {location.address || "Current location"}
                        </Popup>
                      </Marker>
                    )}

                  {/* Provider markers */}
                  {sortedProviders.map((provider) => {
                    const providerLocation =
                      provider.providerId?.location;

                    if (
                      providerLocation?.latitude == null ||
                      providerLocation?.longitude == null
                    ) {
                      return null;
                    }

                    const providerId =
                      provider.providerId?._id ||
                      provider.providerId?.id;

                    const routeInfo =
                      providerDistances[providerId];

                    return (
                      <Marker
                        key={`map-${provider._id}`}
                        position={[
                          Number(providerLocation.latitude),
                          Number(providerLocation.longitude),
                        ]}
                        icon={providerIcon}
                        eventHandlers={{
                          click: () =>
                            setSelectedMapProvider(provider),
                        }}
                      >
                        <Popup>
                          <div style={{ minWidth: "190px" }}>
                            <strong>
                              {provider.providerId?.name ||
                                "Homezy Provider"}
                            </strong>
                            <br />
                            <span>{provider.serviceName}</span>
                            <br />
                            <strong>₹{provider.price}</strong>

                            {routeInfo && (
                              <>
                                <br />
                                <span>
                                  {formatDistance(
                                    routeInfo.distanceKm
                                  )}
                                  {" • "}
                                  {formatDuration(
                                    routeInfo.durationMinutes
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 4px 0",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  📍 Click a provider marker to view details
                </span>

                <button
                  type="button"
                  className="map-button"
                  onClick={handleShowAllProviders}
                >
                  <MapPin size={15} />
                  Show All Providers
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FindServices;
