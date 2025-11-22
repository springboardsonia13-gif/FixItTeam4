
// src/pages/provider/ProfileView.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axiosInstance";

export default function ProfileView() {
  const [form, setForm] = useState({ categories: [], description: "", location: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/provider/profile");
        if (res?.data && Object.keys(res.data).length) {
          let categories = [];
          if (res.data.categories) {
            try { categories = JSON.parse(res.data.categories); } catch { categories = []; }
          }
          setForm({ categories, description: res.data.description || "", location: res.data.location || "" });
        }
      } catch (e) {
        // profile may be empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const AVAILABLE_CATEGORIES = ["Electrician", "Plumber", "Carpenter", "Cleaning"];

  const toggleCategory = (cat) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : [...f.categories, cat]
    }));
  };

  const save = async () => {
    try {
      await api.post("/api/provider/profile", {
        categories: form.categories,
        description: form.description,
        location: form.location
      });
      setMsg("Profile saved ✅");
      setTimeout(() => setMsg(""), 2500);
    } catch (e) {
      console.error(e);
      setMsg("Save failed ❌");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-700 font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Provider Profile</h2>

      <div className="bg-white rounded-3xl shadow-2xl p-6 space-y-6 border border-gray-100">
        {/* Categories */}
        <div>
          <p className="mb-3 font-medium text-gray-700">Select Categories</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AVAILABLE_CATEGORIES.map(cat => {
              const checked = form.categories.includes(cat);
              return (
                <label
                  key={cat}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                    checked ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(cat)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-200 rounded"
                    aria-checked={checked}
                    aria-label={`Toggle ${cat}`}
                  />
                  <span className="text-sm font-medium text-gray-800">{cat}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="profile-desc" className="block text-sm font-medium text-gray-700 mb-2">Short description</label>
          <textarea
            id="profile-desc"
            className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200"
            placeholder="Describe your services"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={4}
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="profile-location" className="block text-sm font-medium text-gray-700 mb-2">Location (city / area)</label>
          <input
            id="profile-location"
            className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200"
            placeholder="Bhubaneswar, Odisha"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 shadow-md transition transform hover:scale-[1.02]"
            aria-label="Save profile"
          >
            Save Profile
          </button>

          <button
            onClick={() => setForm({ categories: [], description: "", location: "" })}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
            aria-label="Reset profile form"
          >
            Reset
          </button>

          <div className="ml-auto text-sm">
            <div
              role="status"
              aria-live="polite"
              className={`text-sm font-medium ${msg.startsWith("Profile saved") ? "text-green-700" : "text-red-700"}`}
            >
              {msg}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
