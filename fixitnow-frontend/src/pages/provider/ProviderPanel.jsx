
// src/pages/provider/ProviderPanel.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import ChatWindow from "../../components/ChatWindow";
import ServiceChatView from "../../components/ServiceChatView";
import { reverseGeocodeLatLng } from "../../utils/googleLocation";

const TABS = ["Profile", "Services", "Offer Service", "Bookings", "Reviews", "Service Chats"];

function Sidebar({ active, setActive, unreadCount }) {
  return (
    <aside className="w-full md:w-64 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-5 border border-white/50 hover:shadow-xl transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <span className="text-xl">🏢</span>
        <span>Provider Panel</span>
      </h3>
      <nav className="space-y-2" aria-label="Provider panel navigation">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors relative ${
              active === tab
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            aria-pressed={active === tab}
            aria-label={`Open ${tab}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{tab}</span>
              {tab === "Service Chats" && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
}

// Profile pane
function ProfilePane() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ categories: [], description: "", location: "", latitude: null, longitude: null });
  const [verificationStatus, setVerificationStatus] = useState("PENDING");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/provider/profile");
        if (res?.data && Object.keys(res.data).length) {
          setForm({
            categories: Array.isArray(res.data.categories) ? res.data.categories : [],
            description: res.data.description || "",
            location: res.data.location || "",
            latitude: null,
            longitude: null,
          });
          setVerificationStatus(res.data.verificationStatus || "PENDING");
          setVerificationNotes(res.data.verificationNotes || "");
          setDocumentUrl(res.data.verificationDocumentUrl || "");
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (cat) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter((c) => c !== cat) : [...f.categories, cat],
    }));
  };

  const save = async () => {
    try {
      await api.post("/api/provider/profile", {
        categories: form.categories,
        description: form.description,
        location: form.location,
        verificationDocumentUrl: documentUrl,
      });
      setMsg("Profile saved ✅");
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      setMsg("Save failed ❌");
    }
  };

  const fetchMyLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const human = await reverseGeocodeLatLng(latitude, longitude);
          setForm((f) => ({
            ...f,
            location: human || "Location captured near you",
            latitude,
            longitude,
          }));
        } catch (e) {
          console.error("Reverse geocoding failed", e);
          setForm((f) => ({
            ...f,
            location: "Location captured near you",
            latitude,
            longitude,
          }));
        }
        setLocLoading(false);
      },
      (err) => {
        alert("Unable to retrieve your location");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600">Loading profile…</div>
        </div>
      </div>
    );
  }

  const ALL = ["Electrician", "Plumber", "Carpenter", "Cleaning"];

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-gray-100">
      <h4 className="text-xl font-semibold text-gray-800">Manage Profile</h4>

      <div>
        <div className="text-sm font-medium mb-2 text-gray-700">Categories</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ALL.map((c) => {
            const checked = form.categories.includes(c);
            return (
              <label
                key={c}
                className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer ${
                  checked ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(c)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-200 rounded"
                  aria-checked={checked}
                  aria-label={`Toggle ${c}`}
                />
                <span className="text-sm font-medium text-gray-800">{c}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-1 text-gray-700">Description</div>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200"
          rows={4}
          aria-label="Profile description"
        />
      </div>

      <div>
        <div className="text-sm font-medium mb-1 text-gray-700">Location</div>
        <div className="flex gap-2">
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200"
            placeholder="City / area"
            aria-label="Location"
          />
          <button
            onClick={fetchMyLocation}
            disabled={locLoading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 disabled:opacity-60 transition shadow-sm"
            aria-label="Use my current location"
          >
            {locLoading ? "Locating…" : "Use my location"}
          </button>
        </div>
      </div>

      {/* Verification Status */}
      <div className="border-t pt-4">
        <div className="text-sm font-medium mb-2 text-gray-700">Verification Status</div>
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            verificationStatus === "APPROVED" ? "bg-green-100 text-green-800" :
            verificationStatus === "REJECTED" ? "bg-red-100 text-red-800" :
            "bg-yellow-100 text-yellow-800"
          }`}>
            {verificationStatus === "APPROVED" ? "✓ Verified" :
             verificationStatus === "REJECTED" ? "✗ Rejected" :
             "⏳ Pending Verification"}
          </span>
        </div>
        
        {verificationNotes && (
          <div className="bg-gray-50 p-3 rounded-lg mb-3">
            <div className="text-xs text-gray-600 mb-1">Admin Notes:</div>
            <div className="text-sm text-gray-800">{verificationNotes}</div>
          </div>
        )}

        <div>
          <div className="text-sm font-medium mb-1 text-gray-700">Verification Document URL</div>
          <input
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
            className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200"
            placeholder="Enter document URL (e.g., Google Drive link, Dropbox link)"
            aria-label="Verification document URL"
          />
          <div className="text-xs text-gray-500 mt-1">
            Upload your verification documents (ID, certifications) to a cloud service and paste the link here
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 shadow-md transition"
        >
          Save Profile
        </button>

        <button
          onClick={() => setForm({ categories: [], description: "", location: "" })}
          className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
        >
          Reset
        </button>

        <div className="ml-auto text-sm" role="status" aria-live="polite">
          <span className={`${msg.startsWith("Profile saved") ? "text-green-700" : "text-red-700"}`}>{msg}</span>
        </div>
      </div>
    </div>
  );
}

// Services pane
function ServicesPane() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/provider/services");
      setServices(res.data || []);
    } catch (e) {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await api.delete(`/api/provider/services/${id}`);
      fetch();
    } catch (e) {
      alert("Delete failed");
    }
  };

  const openEdit = (s) => setEditing({ ...s });
  const closeEdit = () => setEditing(null);

  const saveEdit = async () => {
    try {
      await api.put(`/api/provider/services/${editing.id}`, editing);
      closeEdit();
      fetch();
    } catch (e) {
      alert("Update failed");
    }
  };

  const CreateForm = ({ onClose }) => {
    const [form, setForm] = useState({
      category: "",
      subcategory: "",
      description: "",
      price: "",
      availability: [],
      // location is the human-readable locationName
      location: "",
      latitude: null,
      longitude: null,
    });
    const [locLoading, setLocLoading] = useState(false);

    const submit = async () => {
      try {
        await api.post("/api/provider/services", {
          category: form.category,
          subcategory: form.subcategory,
          description: form.description,
          price: form.price ? Number(form.price) : null,
          availability: form.availability,
          location: form.location,
          latitude: form.latitude,
          longitude: form.longitude,
        });
        onClose();
        fetch();
      } catch (e) {
        alert("Create failed");
      }
    };

    const fetchMyLocation = () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }
      setLocLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const human = await reverseGeocodeLatLng(latitude, longitude);
            setForm((f) => ({
              ...f,
              location: human || "Location captured near you",
              latitude,
              longitude,
            }));
          } catch (e) {
            console.error("Reverse geocoding failed", e);
            setForm((f) => ({
              ...f,
              location: "Location captured near you",
              latitude,
              longitude,
            }));
          }
          setLocLoading(false);
        },
        (err) => {
          alert("Unable to retrieve your location");
          setLocLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    return (
      <div className="bg-white p-4 rounded-2xl shadow border border-gray-100">
        <h5 className="font-semibold mb-3">Create Service</h5>
        <input
          className="w-full border-2 border-gray-200 px-3 py-2 mb-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          className="w-full border-2 border-gray-200 px-3 py-2 mb-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
          placeholder="Subcategory"
          value={form.subcategory}
          onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
        />
        <textarea
          className="w-full border-2 border-gray-200 px-3 py-2 mb-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />
        <input
          className="w-full border-2 border-gray-200 px-3 py-2 mb-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <div className="flex gap-2 mb-2">
          <input
            className="w-full border-2 border-gray-200 px-3 py-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <button
            onClick={fetchMyLocation}
            disabled={locLoading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 disabled:opacity-60 transition"
            aria-label="Use my location"
          >
            {locLoading ? "Locating…" : "Use my location"}
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={submit} className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-xl">Create</button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200">Cancel</button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600">Loading services…</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-gray-800">My Services</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreating(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-xl font-medium shadow-sm hover:from-green-600 hover:to-emerald-700 transition"
            aria-label="Create new service"
          >
            + New Service
          </button>
          <button onClick={fetch} className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">Refresh</button>
        </div>
      </div>

      {creating && <div className="mb-4"><CreateForm onClose={() => setCreating(false)} /></div>}

      {services.length === 0 ? (
        <div className="text-gray-500">No services. Create one to get started.</div>
      ) : (
        <div className="grid gap-3">
          {services.map((s) => (
            <div key={s.id} className="p-4 bg-white rounded-2xl shadow-sm flex justify-between items-start border border-gray-100">
              <div>
                <div className="font-semibold text-gray-800">{s.category} {s.subcategory ? `— ${s.subcategory}` : ""}</div>
                <div className="text-sm text-gray-600 mt-1">{s.description}</div>
                <div className="text-sm text-gray-500 mt-1">Price: {s.price ?? "N/A"} · Location: {s.location ?? "N/A"}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => openEdit(s)} className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-3 py-1 rounded-xl">Edit</button>
                <button onClick={() => remove(s.id)} className="bg-red-500 text-white px-3 py-1 rounded-xl">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h4 className="text-lg font-semibold mb-3">Edit Service</h4>
            <input className="w-full border-2 border-gray-200 px-3 py-2 mb-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="Category" value={editing.category || ""} onChange={e => setEditing({ ...editing, category: e.target.value })} />
            <input className="w-full border-2 border-gray-200 px-3 py-2 mb-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="Subcategory" value={editing.subcategory || ""} onChange={e => setEditing({ ...editing, subcategory: e.target.value })} />
            <textarea className="w-full border-2 border-gray-200 px-3 py-2 mb-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="Description" rows={3} value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            <input className="w-full border-2 border-gray-200 px-3 py-2 mb-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="Price" value={editing.price ?? ""} onChange={e => setEditing({ ...editing, price: e.target.value })} />
            <div className="flex gap-2 mb-4">
              <input className="w-full border-2 border-gray-200 px-3 py-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="Location" value={editing.location ?? ""} onChange={e => setEditing({ ...editing, location: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button onClick={saveEdit} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl">Save</button>
              <button onClick={closeEdit} className="px-4 py-2 rounded-xl border border-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Offer Service pane
function OfferServicePane() {
  const [form, setForm] = useState({
    category: "",
    subcategory: "",
    description: "",
    price: "",
    // location is the human-readable locationName
    location: "",
    latitude: null,
    longitude: null,
  });
  const [msg, setMsg] = useState("");
  const [locLoading, setLocLoading] = useState(false);

  const submit = async () => {
    try {
      await api.post("/api/provider/services", {
        category: form.category,
        subcategory: form.subcategory,
        description: form.description,
        price: form.price ? Number(form.price) : null,
        location: form.location,
        latitude: form.latitude,
        longitude: form.longitude,
      });
      setMsg("Service created ✅");
      setForm({ category: "", subcategory: "", description: "", price: "", location: "" });
      setTimeout(() => setMsg(""), 2500);
    } catch (e) {
      setMsg("Create failed ❌");
    }
  };

  const fetchMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const human = await reverseGeocode(latitude, longitude);
        setForm((f) => ({
          ...f,
          location: human || "Location captured near you",
          latitude,
          longitude,
        }));
        setLocLoading(false);
      },
      (err) => {
        alert("Unable to retrieve your location");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <h4 className="text-xl font-semibold mb-3 text-gray-800">Offer a Service</h4>
      <input className="w-full border-2 border-gray-200 px-3 py-2 mb-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      <input className="w-full border-2 border-gray-200 px-3 py-2 mb-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="Subcategory" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} />
      <textarea className="w-full border-2 border-gray-200 px-3 py-2 mb-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input className="w-full border-2 border-gray-200 px-3 py-2 mb-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
      <div className="flex gap-2 mb-4">
        <input className="w-full border-2 border-gray-200 px-3 py-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <button
          onClick={fetchMyLocation}
          disabled={locLoading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 disabled:opacity-60 transition"
        >
          {locLoading ? "Locating…" : "Use my location"}
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={submit} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl">Create</button>
        {msg && <div className="self-center text-sm text-green-700">{msg}</div>}
      </div>
    </div>
  );
}

// Bookings pane
function BookingsPane({ setChatCustomer }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerDetails, setCustomerDetails] = useState({});

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/provider/bookings");
      const bookingsData = res.data || [];
      setBookings(bookingsData);

      // Fetch customer details
      const details = {};
      for (const booking of bookingsData) {
        try {
          const customerRes = await api.get(`/api/users/${booking.customerId}`);
          details[booking.customerId] = customerRes.data;
        } catch (err) {
          console.error(`Failed to fetch customer ${booking.customerId}`, err);
        }
      }
      setCustomerDetails(details);
    } catch (e) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const [updatingId, setUpdatingId] = useState(null);

  const update = async (id, action) => {
    try {
      setUpdatingId(id);
      const response = await api.post(`/api/provider/bookings/${id}/${action}`);
      
      // Update local state immediately
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === id 
            ? { ...booking, status: response.data.status }
            : booking
        )
      );
    } catch (e) {
      console.error(e);
      // Refresh to get correct state from server
      await fetch();
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600">Loading bookings…</div>
        </div>
      </div>
    );
  }
  if (bookings.length === 0) {
    return <div className="p-4 text-gray-500">No booking requests.</div>;
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const customer = customerDetails[b.customerId];
        return (
          <div key={b.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-gray-800">Booking #{b.id} — Service {b.serviceId || "—"}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Customer: <span className="font-medium text-gray-700">{customer?.name || `#${b.customerId}`}</span>
                  <span className="mx-2">·</span>
                  Created: <span className="text-gray-600">{b.createdAt ? new Date(b.createdAt).toLocaleString() : "N/A"}</span>
                </div>
                {customer?.email && <div className="text-sm text-gray-500">Email: {customer.email}</div>}
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800">{b.status}</span>
              </div>
            </div>

            <p className="mt-2 text-gray-700">{b.notes || "No notes."}</p>
            <div className="mt-2 text-sm text-gray-500">
              📍 {customer?.location || "Location not provided"} · 🕒 {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : "N/A"} {b.timeSlot || ""}
            </div>

            <div className="flex gap-2 mt-3">
              {b.customerLatitude && b.customerLongitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${b.customerLatitude},${b.customerLongitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-xl hover:from-red-600 hover:to-orange-600 transition flex items-center gap-1"
                  title="Open customer location in Google Maps"
                >
                  🗺️ Maps
                </a>
              )}
              <button
                onClick={() => setChatCustomer({ id: b.customerId, name: customer?.name || `Customer #${b.customerId}` })}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-xl hover:from-purple-600 hover:to-pink-600 transition"
              >
                💬 Chat
              </button>

              {b.status === "PENDING" && (
                <>
                  <button 
                    onClick={() => update(b.id, "accept")} 
                    disabled={updatingId === b.id}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-60 transition"
                  >
                    {updatingId === b.id ? "Updating…" : "Accept"}
                  </button>
                  <button 
                    onClick={() => update(b.id, "reject")} 
                    disabled={updatingId === b.id}
                    className="bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600 disabled:opacity-60 transition"
                  >
                    {updatingId === b.id ? "Updating…" : "Reject"}
                  </button>
                </>
              )}

              {b.status === "CONFIRMED" && (
                <>
                  <div className="text-green-700 font-semibold bg-green-50 px-3 py-1 rounded-xl border border-green-200 text-sm">
                    ✓ Accepted
                  </div>
                  <button 
                    onClick={() => update(b.id, "complete")} 
                    disabled={updatingId === b.id}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-3 py-1 rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 transition"
                  >
                    {updatingId === b.id ? "Updating…" : "Mark Complete"}
                  </button>
                </>
              )}

              {b.status === "REJECTED" && (
                <div className="text-red-700 font-semibold bg-red-50 px-3 py-1 rounded-xl border border-red-200 text-sm">
                  ✗ Rejected
                </div>
              )}

              {b.status === "COMPLETED" && (
                <div className="text-blue-700 font-semibold bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 text-sm">
                  ✓ Completed
                </div>
              )}

              {b.status === "CANCELLED" && (
                <div className="text-gray-700 font-semibold bg-gray-50 px-3 py-1 rounded-xl border border-gray-200 text-sm">
                  Cancelled by Customer
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Reviews pane
function ReviewsPane() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const userRes = await api.get("/api/auth/me");
        const providerId = userRes.data.id;

        const res = await api.get(`/api/reviews/provider/${providerId}`);
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating || 0);
      } catch (e) {
        console.error("Failed to fetch reviews", e);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600">Loading reviews…</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-gray-100">
        <h4 className="text-xl font-semibold mb-2 text-gray-800">My Reviews</h4>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-indigo-700">{avgRating.toFixed(1)} ⭐</div>
          <div className="text-gray-600">{reviews.length} reviews</div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="p-4 text-gray-500">No reviews yet.</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < r.rating ? "text-yellow-400 text-xl" : "text-gray-300 text-xl"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">by Customer #{r.customerId}</span>
                  </div>
                  <p className="text-gray-700">{r.comment || "No comment"}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main component
export default function ProviderPanel() {
  const [active, setActive] = useState("Profile");
  const [chatCustomer, setChatCustomer] = useState(null);
  const [totalUnreadChats, setTotalUnreadChats] = useState(0);

  useEffect(() => {
    const fetchTotalUnreadChats = async () => {
      try {
        const res = await api.get("/api/disputes/service-chats/unread-total");
        setTotalUnreadChats(res.data.totalUnread || 0);
      } catch (e) {
        console.error("Failed to fetch unread count", e);
      }
    };

    fetchTotalUnreadChats();
    // Refresh unread count every 5 seconds
    const interval = setInterval(fetchTotalUnreadChats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Provider Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage your profile, services, bookings, and reviews in one place.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="col-span-1">
            <Sidebar active={active} setActive={setActive} unreadCount={totalUnreadChats} />
          </div>
          <div className="col-span-1 md:col-span-4 space-y-6">
            {active === "Profile" && <ProfilePane />}
            {active === "Services" && <ServicesPane />}
            {active === "Offer Service" && <OfferServicePane />}
            {active === "Bookings" && <BookingsPane setChatCustomer={setChatCustomer} />}
            {active === "Reviews" && <ReviewsPane />}
            {active === "Service Chats" && <ServiceChatView />}
          </div>
        </div>
      </div>

      {chatCustomer && (
        <ChatWindow
          receiverId={chatCustomer.id}
          receiverName={chatCustomer.name}
          onClose={() => setChatCustomer(null)}
        />
      )}
    </div>
  );
}
