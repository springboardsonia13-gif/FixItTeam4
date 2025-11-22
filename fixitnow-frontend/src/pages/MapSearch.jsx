import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '600px' };
const defaultCenter = { lat: 28.6139, lng: 77.2090 };

export default function MapSearch() {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [radiusKm, setRadiusKm] = useState(5);
  // Human-readable location name (from autocomplete or reverse geocode)
  const [locationName, setLocationName] = useState("");
  const inputRef = useRef(null);
  const mapRef = useRef();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // ⭐ Auto-detect user location on load (lat/lng)
  useEffect(() => {
    if (!isLoaded) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setMapCenter({ lat, lng });
        fetchServices(lat, lng, radiusKm, undefined);
      },
      () => {
        console.warn("User denied location. Using default center.");
        fetchServices(defaultCenter.lat, defaultCenter.lng, radiusKm, undefined);
      }
    );
  }, [isLoaded]);

  // Autocomplete for typing location (captures formatted address + lat/lng)
  useEffect(() => {
    if (!isLoaded) return;
    if (!inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {});

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      const loc = place.geometry.location;
      const lat = loc.lat();
      const lng = loc.lng();
      const name = place.formatted_address || place.name || "";

      setLocationName(name);
      setMapCenter({ lat, lng });
      fetchServices(lat, lng, radiusKm, name);
    });

    return () => {
      if (inputRef.current) window.google.maps.event.clearInstanceListeners(inputRef.current);
    };
  }, [isLoaded, radiusKm]);

  async function fetchServices(lat, lng, radius, locationParam) {
    try {
      const base = import.meta.env.VITE_API_BASE_URL || '';
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radiusKm: radius.toString(),
      });
      if (locationParam) {
        params.set('location', locationParam);
      }

      const res = await fetch(`${base}/api/services?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error(err);
    }
  }

  if (loadError)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h3 className="text-lg font-bold text-gray-700 mb-2">Map failed to load</h3>
          <p className="text-sm text-gray-500">Check your Google Maps API key.</p>
        </div>
      </div>
    );

  if (!isLoaded)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-gray-700">Loading maps...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Search Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1 w-full md:max-w-2xl">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search location
            </label>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search location (autocomplete)"
                className="w-full border-2 border-gray-300 pl-12 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <span>Radius (km)</span>
              <input
                type="number"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-20 border-2 border-gray-300 rounded-xl px-3 py-2 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                min={1}
              />
            </label>

            <button
              onClick={() => fetchServices(mapCenter.lat, mapCenter.lng, radiusKm, locationName || undefined)}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl"
            >
              Search
            </button>

            {/* ⭐ BUTTON: Use My Location (navigator.geolocation + Google Maps) */}
            <button
              onClick={() =>
                navigator.geolocation.getCurrentPosition(
                  async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    setMapCenter({ lat, lng });

                    // Try to reverse-geocode via Google Maps Geocoder (SDK already loaded by useLoadScript)
                    try {
                      const geocoder = new window.google.maps.Geocoder();
                      const latlng = { lat, lng };
                      geocoder.geocode({ location: latlng }, (results, status) => {
                        if (status === "OK" && results && results.length > 0) {
                          const name = results[0].formatted_address || "";
                          setLocationName(name);
                          fetchServices(lat, lng, radiusKm, name || undefined);
                        } else {
                          fetchServices(lat, lng, radiusKm, undefined);
                        }
                      });
                    } catch (e) {
                      console.error("MapSearch geocoder error", e);
                      fetchServices(lat, lng, radiusKm, undefined);
                    }
                  },
                  (err) => {
                    console.error("Use My Location error", err);
                    fetchServices(mapCenter.lat, mapCenter.lng, radiusKm, locationName || undefined);
                  },
                  { enableHighAccuracy: true, timeout: 15000 }
                )
              }
              className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold shadow hover:shadow-md"
            >
              Use My Location
            </button>
          </div>
        </div>

        {/* MAP */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div style={{ height: mapContainerStyle.height }} className="w-full">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={12}
              center={mapCenter}
              onLoad={onMapLoad}
            >
              {services.map((s) =>
                s.latitude && s.longitude ? (
                  <Marker
                    key={s.id}
                    position={{ lat: Number(s.latitude), lng: Number(s.longitude) }}
                    onClick={() => setSelected(s)}
                    title={`${s.category} — ${s.subcategory}`}
                  />
                ) : null
              )}

              {selected && (
                <InfoWindow
                  position={{
                    lat: Number(selected.latitude),
                    lng: Number(selected.longitude),
                  }}
                  onCloseClick={() => setSelected(null)}
                >
                  <div className="max-w-xs p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <h4 className="text-md font-bold text-gray-800 mb-1">
                      {selected.category} — {selected.subcategory}
                    </h4>
                    <div className="text-sm text-gray-600">
                      Provider: <span className="font-medium">{selected.providerName}</span>
                    </div>
                    <div className="mt-3">
                      <a
                        href={`/services/${selected.id}`}
                        className="text-indigo-600 font-semibold hover:underline text-sm"
                      >
                        View details →
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        </div>

        {/* Service List */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold text-gray-700">Nearby services</h5>
            <span className="text-sm text-gray-500">{services.length} found</span>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className="border border-gray-100 rounded-xl p-3 hover:shadow-md transition bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {s.category} — {s.subcategory}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Provider: {s.providerName}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-green-700">{s.price}</div>
                </div>

                <button
                  onClick={() => {
                    if (s.latitude && s.longitude) {
                      setMapCenter({
                        lat: Number(s.latitude),
                        lng: Number(s.longitude),
                      });
                      fetchServices(
                        Number(s.latitude),
                        Number(s.longitude),
                        radiusKm
                      );
                      setSelected(s);
                    }
                  }}
                  className="mt-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-100"
                >
                  Center on map
                </button>
              </div>
            ))}

            {services.length === 0 && (
              <div className="col-span-full text-center py-6 text-gray-500">
                No services in this area yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
