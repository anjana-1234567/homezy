
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ArrowLeft, MapPin, Navigation, Phone } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./TrackProvider.css";

const providerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function TrackProvider() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const booking = state?.booking;

  const [mapType, setMapType] = useState("street");

  if (!booking) {
    return (
      <div className="track-page">
        <div className="track-card">
          <MapPin size={40} />
          <h2>Booking not found</h2>
          <p>Please open tracking from your My Bookings page.</p>
          <button onClick={() => navigate("/customer/bookings")}>
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const provider = booking.providerId || {};
  const providerName = provider.name || "Service Provider";
  const providerPhone = provider.phone || booking.providerPhone || "";

  // Use actual provider GPS coordinates when the backend supplies them.
  const providerLat = Number(provider.currentLocation?.latitude);
  const providerLng = Number(provider.currentLocation?.longitude);

  const hasProviderLocation =
    Number.isFinite(providerLat) &&
    Number.isFinite(providerLng) &&
    provider.currentLocation?.latitude != null &&
    provider.currentLocation?.longitude != null;

  // Fallback is only for displaying the map, NOT the provider's location.
  const mapCenter = hasProviderLocation
    ? [providerLat, providerLng]
    : [17.385, 78.4867];

  return (
    <div className="track-page">
      <header className="track-header">
        <button
          className="track-back"
          onClick={() => navigate("/customer/bookings")}
        >
          <ArrowLeft size={20} />
          My Bookings
        </button>

        <h1>Track Your Provider</h1>
        <p>Booking: {booking.service || "Home Service"}</p>
      </header>

      <section className="track-card">
        <div className="track-provider-info">
          <div className="track-provider-icon">
            <Navigation size={26} />
          </div>

          <div className="track-provider-details">
            <h2>{providerName}</h2>
            <p>
              {hasProviderLocation
                ? "Provider location received"
                : "Waiting for provider location"}
            </p>
            <span className="track-status">
              Booking status: {booking.status || "ACCEPTED"}
            </span>
          </div>

          {providerPhone && (
            <a className="track-call-button" href={`tel:${providerPhone}`}>
              <Phone size={17} />
              Call
            </a>
          )}
        </div>

        <div className="track-map-toolbar">
          <h3>
            <MapPin size={19} />
            Provider Map
          </h3>

          <button
            onClick={() =>
              setMapType((current) =>
                current === "street" ? "satellite" : "street"
              )
            }
          >
            {mapType === "street" ? "Satellite" : "Street"}
          </button>
        </div>

        <div className="track-map">
          <MapContainer
            center={mapCenter}
            zoom={hasProviderLocation ? 15 : 11}
            scrollWheelZoom
            key={`${mapCenter[0]}-${mapCenter[1]}`}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={
                mapType === "street"
                  ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              }
            />

            {hasProviderLocation && (
              <Marker position={mapCenter} icon={providerIcon}>
                <Popup>{providerName}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {!hasProviderLocation && (
          <div className="track-notice">
            <MapPin size={20} />
            <div>
              <strong>Live location is not available yet.</strong>
              <p>
                The map is only a preview. The provider's GPS coordinates
                must be sent from the provider app and saved through the
                backend before their real location can appear here.
              </p>
            </div>
          </div>
        )}

        {hasProviderLocation && (
          <div className="track-notice">
            <CheckCircleIcon />
            <div>
              <strong>Provider coordinates received.</strong>
              <p>
                Automatic live updates still require a working GPS update API.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function CheckCircleIcon() {
  return <MapPin size={20} />;
}

export default TrackProvider;
