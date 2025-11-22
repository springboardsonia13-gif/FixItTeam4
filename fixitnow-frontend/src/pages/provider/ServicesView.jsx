
// src/pages/provider/ServicesView.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axiosInstance";

function ServiceCard({ s, onEdit, onDelete }) {
  return (
    <article className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="pr-4">
          <h3 className="font-semibold text-lg text-gray-800">
            {s.category} {s.subcategory ? `— ${s.subcategory}` : ""}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{s.description || "No description."}</p>
          <div className="mt-2 text-sm text-gray-500">Price: {s.price != null ? `₹ ${s.price}` : "N/A"}</div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onEdit(s)}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm shadow-sm hover:from-indigo-700 hover:to-blue-700 transition"
            aria-label={`Edit service ${s.id}`}
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(s)}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-red-500 text-white text-sm shadow-sm hover:bg-red-600 transition"
            aria-label={`Delete service ${s.id}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function ServiceForm({ onCancel, onSave, initial }) {
  const [form, setForm] = useState(
    initial || {
      category: "",
      subcategory: "",
      description: "",
      price: "",
      location: "",
    }
  );

  useEffect(() => {
    setForm(
      initial || {
        category: "",
        subcategory: "",
        description: "",
        price: "",
        location: "",
      }
    );
  }, [initial]);

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.price === "" || payload.price == null) delete payload.price;
    onSave(payload);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <form
        onSubmit={submit}
        className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg border border-gray-100 z-10"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {initial ? "Edit Service" : "Add Service"}
        </h3>

        <label className="block text-sm text-gray-700 mb-1">Category</label>
        <input
          className="w-full border-2 border-gray-200 px-3 py-2 mb-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />

        <label className="block text-sm text-gray-700 mb-1">Subcategory (optional)</label>
        <input
          className="w-full border-2 border-gray-200 px-3 py-2 mb-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
          placeholder="Subcategory (optional)"
          value={form.subcategory}
          onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
        />

        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea
          className="w-full border-2 border-gray-200 px-3 py-2 mb-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Price (number)</label>
            <input
              className="w-full border-2 border-gray-200 px-3 py-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
              placeholder="Price (number)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Location (city/area)</label>
            <input
              className="w-full border-2 border-gray-200 px-3 py-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
              placeholder="Location (city/area)"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ServicesView() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // service being edited (object) or null
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/provider/services");
      setServices(res.data || []);
    } catch (e) {
      console.error("fetch services", e);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      if (editing) {
        await api.put(`/api/provider/services/${editing.id}`, payload);
      } else {
        await api.post("/api/provider/services", payload);
      }
      setShowForm(false);
      setEditing(null);
      fetch();
    } catch (e) {
      console.error("save service", e);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await api.delete(`/api/provider/services/${s.id}`);
      fetch();
    } catch (e) {
      console.error("delete service", e);
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-700 font-medium">Loading services…</p>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">My Services</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm hover:from-indigo-700 hover:to-blue-700 transition"
            aria-label="Add service"
          >
            + Add Service
          </button>
          <button
            onClick={fetch}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
            aria-label="Refresh services"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {services.length === 0 && <div className="text-gray-500">You have not added any services yet.</div>}
        {services.map((s) => (
          <ServiceCard key={s.id} s={s} onEdit={(sv) => { setEditing(sv); setShowForm(true); }} onDelete={handleDelete} />
        ))}
      </div>

      {showForm && (
        <ServiceForm
          onCancel={() => {
            setEditing(null);
            setShowForm(false);
          }}
          onSave={handleSave}
          initial={editing}
        />
      )}

      {/* small saving indicator (visual only) */}
      {saving && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-100 rounded-xl shadow p-3 text-sm">
          Saving...
        </div>
      )}
    </section>
  );
}
