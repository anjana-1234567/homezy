// ========================================
// HOMEZY LOCATION UTILITY
// ========================================

import { API_ENDPOINTS } from "../config/api";

// We store location separately for every logged-in user.
// Example:
// homezy_location_67abc123
// homezy_location_67xyz456

const getLocationStorageKey = (userId) => {
  return userId
    ? `homezy_location_${userId}`
    : "homezy_location_guest";
};

// ========================================
// GET LOGGED-IN USER ID
// ========================================

const getLoggedInUserId = () => {
  try {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    const user = JSON.parse(storedUser);

    return (
      user?._id ||
      user?.id ||
      user?.userId ||
      null
    );
  } catch (error) {
    console.error(
      "Failed to get logged-in user:",
      error
    );

    return null;
  }
};

// ========================================
// GET SAVED LOCATION
// ========================================

export const getSavedLocation = (userId = null) => {
  try {
    const actualUserId =
      userId || getLoggedInUserId();

    const storageKey =
      getLocationStorageKey(actualUserId);

    const savedLocation =
      localStorage.getItem(storageKey);

    if (!savedLocation) {
      return null;
    }

    return JSON.parse(savedLocation);
  } catch (error) {
    console.error(
      "Failed to read saved location:",
      error
    );

    return null;
  }
};

// ========================================
// SAVE LOCATION LOCALLY
// ========================================

export const saveLocation = (
  locationData,
  userId = null
) => {
  try {
    const actualUserId =
      userId || getLoggedInUserId();

    const storageKey =
      getLocationStorageKey(actualUserId);

    localStorage.setItem(
      storageKey,
      JSON.stringify(locationData)
    );
  } catch (error) {
    console.error(
      "Failed to save location locally:",
      error
    );
  }
};

// ========================================
// CLEAR USER LOCATION
// ========================================

export const clearSavedLocation = (
  userId = null
) => {
  try {
    const actualUserId =
      userId || getLoggedInUserId();

    const storageKey =
      getLocationStorageKey(actualUserId);

    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error(
      "Failed to clear saved location:",
      error
    );
  }
};

// ========================================
// GET BROWSER GPS LOCATION
// ========================================

const getBrowserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          "Geolocation is not supported by this browser."
        )
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          accuracy:
            position.coords.accuracy || null,
        });
      },

      (error) => {
        let message =
          "Unable to get your current location.";

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          message =
            "Location permission was denied. Please allow location access in your browser.";
        } else if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {
          message =
            "Your current location is unavailable.";
        } else if (
          error.code ===
          error.TIMEOUT
        ) {
          message =
            "Location request timed out. Please try again.";
        }

        reject(new Error(message));
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
};

// ========================================
// REVERSE GEOCODING
// ========================================

const getReadableAddress = async (
  latitude,
  longitude
) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );

    if (response.ok) {
      const addressData =
        await response.json();

      if (addressData?.display_name) {
        return addressData.display_name;
      }
    }
  } catch (error) {
    console.error(
      "Reverse geocoding error:",
      error
    );
  }

  return "Current Location";
};

// ========================================
// GET + SAVE CURRENT LOCATION
// ========================================

export const getCurrentLocation = async (
  userId = null
) => {
  // ----------------------------------------
  // Determine user
  // ----------------------------------------

  const actualUserId =
    userId || getLoggedInUserId();

  if (!actualUserId) {
    throw new Error(
      "User information not found. Please login again."
    );
  }

  // ----------------------------------------
  // Get real browser GPS
  // ----------------------------------------

  const coords =
    await getBrowserLocation();

  // ----------------------------------------
  // Reverse geocode
  // ----------------------------------------

  const readableAddress =
    await getReadableAddress(
      coords.latitude,
      coords.longitude
    );

  // ----------------------------------------
  // Save to MongoDB
  // ----------------------------------------

  const response = await fetch(
    `${API_ENDPOINTS.LOCATION}/${actualUserId}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        latitude:
          coords.latitude,

        longitude:
          coords.longitude,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to save location to server."
    );
  }

  // ----------------------------------------
  // Create common location object
  // ----------------------------------------

  const locationData = {
    latitude:
      coords.latitude,

    longitude:
      coords.longitude,

    accuracy:
      coords.accuracy,

    address:
      readableAddress,
  };

  // ----------------------------------------
  // Save separately for THIS USER
  // ----------------------------------------

  saveLocation(
    locationData,
    actualUserId
  );

  return locationData;
};