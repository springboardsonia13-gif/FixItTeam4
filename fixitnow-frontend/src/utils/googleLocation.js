let googleMapsPromise = null;

function loadGoogleMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("Window is undefined"));
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }
  if (googleMapsPromise) return googleMapsPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("VITE_GOOGLE_MAPS_API_KEY is missing");
    return Promise.reject(new Error("Google Maps API key missing"));
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-google-maps-loader='true']");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "true";
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

/**
 * Reverse geocode lat/lng → human-readable locationName using Google Maps Geocoder.
 * Returns a string like "Area, City, State, Country".
 */
export async function reverseGeocodeLatLng(latitude, longitude) {
  await loadGoogleMaps();

  return new Promise((resolve) => {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: Number(latitude), lng: Number(longitude) };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        const best = results[0];
        const formatted = best.formatted_address || "";
        const addr = best.address_components || [];

        const getPart = (types) => {
          const comp = addr.find((c) => types.every((t) => c.types.includes(t)));
          return comp ? comp.long_name : null;
        };

        const street =
          getPart(["route"]) ||
          getPart(["street_address"]) ||
          getPart(["premise"]) ||
          getPart(["sublocality_level_2"]);
        const area =
          getPart(["sublocality_level_1", "sublocality"]) ||
          getPart(["neighborhood"]) ||
          getPart(["locality"]);
        const city =
          getPart(["locality"]) ||
          getPart(["administrative_area_level_2"]);
        const state = getPart(["administrative_area_level_1"]);
        const country = getPart(["country"]);

        // Prefer a concise custom label: street / area / city / state / country
        const parts = [street, area, city, state, country].filter(Boolean);
        const synthetic = parts.join(", ");

        // If we cannot build a synthetic label, fall back to formatted_address.
        // To avoid very long strings, keep only first few components.
        let fallback = formatted;
        if (formatted) {
          const split = formatted.split(",").map((s) => s.trim());
          fallback = split.slice(0, 4).join(", ");
        }

        const locationName = synthetic || fallback || "Location near you";
        resolve(locationName);
      } else {
        console.error("Geocoder failed:", status, results);
        resolve("Location near you");
      }
    });
  });
}
