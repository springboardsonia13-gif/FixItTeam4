

// import React, { useEffect, useState } from "react";
// import api from "../api/axiosInstance";
// import ChatWindow from "../components/ChatWindow";

// export default function AdminDashboard() {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [stats, setStats] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [providers, setProviders] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [services, setServices] = useState([]);
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [chatUser, setChatUser] = useState(null);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       // Fetch all users
//       const usersRes = await api.get("/api/admin/users");
//       const allUsers = usersRes.data || [];
//       setUsers(allUsers);

//       // Filter by role
//       setProviders(allUsers.filter(u => u.role === "PROVIDER"));
//       setCustomers(allUsers.filter(u => u.role === "CUSTOMER"));

//       // Fetch bookings
//       const bookingsRes = await api.get("/api/admin/bookings");
//       setBookings(bookingsRes.data || []);

//       // Fetch services
//       const servicesRes = await api.get("/api/admin/services");
//       setServices(servicesRes.data || []);

//       // Calculate stats
//       setStats({
//         totalUsers: allUsers.length,
//         providers: allUsers.filter(u => u.role === "PROVIDER").length,
//         customers: allUsers.filter(u => u.role === "CUSTOMER").length,
//         bookings: bookingsRes.data?.length || 0,
//         services: servicesRes.data?.length || 0,
//         pendingBookings: bookingsRes.data?.filter(b => b.status === "PENDING").length || 0
//       });
//     } catch (e) {
//       console.error("Failed to fetch admin data", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteUser = async (userId) => {
//     if (!window.confirm("Are you sure you want to delete this user?")) return;
//     try {
//       await api.delete(`/api/admin/users/${userId}`);
//       alert("User deleted successfully");
//       fetchDashboardData();
//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to delete user");
//     }
//   };

//   const verifyProvider = async (providerId) => {
//     try {
//       await api.post(`/api/admin/providers/${providerId}/verify`);
//       alert("Provider verified successfully");
//       fetchDashboardData();
//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to verify provider");
//     }
//   };

//   const deleteService = async (serviceId) => {
//     if (!window.confirm("Delete this service?")) return;
//     try {
//       await api.delete(`/api/admin/services/${serviceId}`);
//       alert("Service deleted");
//       fetchDashboardData();
//     } catch (err) {
//       alert("Failed to delete service");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
//         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
//           <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-lg font-medium text-gray-700">Loading admin dashboard...</p>
//           <p className="text-sm text-gray-400 mt-2">Fetching users, bookings and services</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10">
//       <div className="max-w-7xl mx-auto px-6">
//         {/* Header */}
//         <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
//           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
//               <p className="text-gray-500 mt-1">Manage users, providers, services and bookings</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => fetchDashboardData()}
//                 className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg transition transform hover:scale-[1.02]"
//                 aria-label="Refresh dashboard"
//               >
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//           <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
//             <h3 className="text-sm text-gray-500">Total Users</h3>
//             <p className="text-2xl font-semibold text-gray-800">{stats?.totalUsers ?? 0}</p>
//           </div>
//           <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
//             <h3 className="text-sm text-gray-500">Providers</h3>
//             <p className="text-2xl font-semibold text-indigo-700">{stats?.providers ?? 0}</p>
//           </div>
//           <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
//             <h3 className="text-sm text-gray-500">Customers</h3>
//             <p className="text-2xl font-semibold text-purple-700">{stats?.customers ?? 0}</p>
//           </div>
//           <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
//             <h3 className="text-sm text-gray-500">Total Bookings</h3>
//             <p className="text-2xl font-semibold text-orange-600">{stats?.bookings ?? 0}</p>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-3xl shadow mb-6 overflow-hidden">
//           <div className="flex border-b overflow-x-auto">
//             {["overview", "users", "providers", "services", "bookings"].map(tab => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-6 py-3 font-medium capitalize whitespace-nowrap transition-colors ${
//                   activeTab === tab
//                     ? "border-b-2 border-indigo-600 text-indigo-700"
//                     : "text-gray-600 hover:text-indigo-600"
//                 }`}
//                 aria-pressed={activeTab === tab}
//                 aria-label={`Switch to ${tab} tab`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>

//           <div className="p-6">
//             {/* Overview Tab */}
//             {activeTab === "overview" && (
//               <div className="space-y-6">
//                 <div>
//                   <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
//                   <div className="space-y-2">
//                     {bookings.slice(0, 5).map(b => (
//                       <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
//                         <div>
//                           <div className="font-medium">Booking #{b.id}</div>
//                           <div className="text-sm text-gray-500">
//                             Service #{b.serviceId} • Customer #{b.customerId} • Provider #{b.providerId}
//                           </div>
//                         </div>
//                         <span className={`px-2 py-1 rounded text-xs ${
//                           b.status === "COMPLETED" ? "bg-green-100 text-green-800" :
//                           b.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
//                           b.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
//                           "bg-red-100 text-red-800"
//                         }`}>
//                           {b.status}
//                         </span>
//                       </div>
//                     ))}
//                     {bookings.length === 0 && <div className="text-gray-500">No recent bookings available.</div>}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Users Tab */}
//             {activeTab === "users" && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">All Users ({users.length})</h3>
//                 <div className="space-y-2">
//                   {users.map(u => (
//                     <div key={u.id} className="flex items-center justify-between border p-3 rounded-lg">
//                       <div className="flex-1">
//                         <div className="font-medium text-gray-800">{u.name}</div>
//                         <div className="text-sm text-gray-500">
//                           {u.email} • <span className="font-medium">{u.role}</span> • {u.location || "No location"}
//                         </div>
//                       </div>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => setChatUser({ id: u.id, name: u.name })}
//                           className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm hover:from-purple-600 hover:to-pink-600 shadow-sm transition"
//                           aria-label={`Chat with ${u.name}`}
//                         >
//                           💬 Chat
//                         </button>
//                         <button
//                           onClick={() => deleteUser(u.id)}
//                           className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 shadow-sm transition"
//                           aria-label={`Delete ${u.name}`}
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                   {users.length === 0 && <div className="text-gray-500">No users found.</div>}
//                 </div>
//               </div>
//             )}

//             {/* Providers Tab */}
//             {activeTab === "providers" && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Providers ({providers.length})</h3>
//                 <div className="space-y-2">
//                   {providers.map(p => (
//                     <div key={p.id} className="flex items-center justify-between border p-3 rounded-lg">
//                       <div className="flex-1">
//                         <div className="font-medium text-gray-800">{p.name}</div>
//                         <div className="text-sm text-gray-500">
//                           {p.email} • {p.location || "No location"}
//                         </div>
//                       </div>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => setChatUser({ id: p.id, name: p.name })}
//                           className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm hover:from-purple-600 hover:to-pink-600 shadow-sm transition"
//                           aria-label={`Chat with ${p.name}`}
//                         >
//                           💬 Chat
//                         </button>
//                         <button
//                           onClick={() => verifyProvider(p.id)}
//                           className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg text-sm hover:from-green-600 hover:to-emerald-700 shadow-sm transition"
//                           aria-label={`Verify ${p.name}`}
//                         >
//                           ✓ Verify
//                         </button>
//                         <button
//                           onClick={() => deleteUser(p.id)}
//                           className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 shadow-sm transition"
//                           aria-label={`Delete ${p.name}`}
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                   {providers.length === 0 && <div className="text-gray-500">No providers found.</div>}
//                 </div>
//               </div>
//             )}

//             {/* Services Tab */}
//             {activeTab === "services" && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">All Services ({services.length})</h3>
//                 <div className="space-y-2">
//                   {services.map(s => (
//                     <div key={s.id} className="flex items-center justify-between border p-3 rounded-lg">
//                       <div className="flex-1">
//                         <div className="font-medium text-gray-800">{s.category} - {s.subcategory}</div>
//                         <div className="text-sm text-gray-500">
//                           Provider #{s.providerId} • ₹{s.price} • {s.location}
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => deleteService(s.id)}
//                         className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 shadow-sm transition"
//                         aria-label={`Delete service ${s.id}`}
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   ))}
//                   {services.length === 0 && <div className="text-gray-500">No services available.</div>}
//                 </div>
//               </div>
//             )}

//             {/* Bookings Tab */}
//             {activeTab === "bookings" && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">All Bookings ({bookings.length})</h3>
//                 <div className="space-y-2">
//                   {bookings.map(b => (
//                     <div key={b.id} className="border p-3 rounded-lg bg-white">
//                       <div className="flex justify-between items-start mb-2">
//                         <div>
//                           <div className="font-medium text-gray-800">Booking #{b.id}</div>
//                           <div className="text-sm text-gray-500">
//                             Service #{b.serviceId} • Customer #{b.customerId} • Provider #{b.providerId}
//                           </div>
//                         </div>
//                         <span className={`px-2 py-1 rounded text-xs ${
//                           b.status === "COMPLETED" ? "bg-green-100 text-green-800" :
//                           b.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
//                           b.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
//                           "bg-red-100 text-red-800"
//                         }`}>
//                           {b.status}
//                         </span>
//                       </div>
//                       <div className="text-sm text-gray-600">
//                         Date: {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : "N/A"} • 
//                         Time: {b.timeSlot || "N/A"}
//                       </div>
//                       {b.notes && (
//                         <div className="text-sm text-gray-500 mt-1">Notes: {b.notes}</div>
//                       )}
//                     </div>
//                   ))}
//                   {bookings.length === 0 && <div className="text-gray-500">No bookings yet.</div>}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Chat Window */}
//       {chatUser && (
//         <ChatWindow
//           receiverId={chatUser.id}
//           receiverName={chatUser.name}
//           onClose={() => setChatUser(null)}
//         />
//       )}
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import ChatWindow from "../components/ChatWindow";
import DisputeGroupChat from "../components/DisputeGroupChat";
import UserProfileModal from "../components/UserProfileModal";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [verificationProfiles, setVerificationProfiles] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [selectedGroupChat, setSelectedGroupChat] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [totalUnreadDisputes, setTotalUnreadDisputes] = useState(0);
  const [unreadByDispute, setUnreadByDispute] = useState({});

  const calculateTotalUnreadDisputes = async () => {
    try {
      const disputesRes = await api.get("/api/disputes/admin/all");
      const allDisputes = disputesRes.data || [];
      
      let totalUnread = 0;
      const unreadCounts = {};
      for (const dispute of allDisputes) {
        try {
          const countRes = await api.get(`/api/disputes/${dispute.id}/group-chat/unread-count`);
          const count = countRes.data.unreadCount || 0;
          unreadCounts[dispute.id] = count;
          totalUnread += count;
        } catch (e) {
          // Skip if error
          unreadCounts[dispute.id] = 0;
        }
      }
      setTotalUnreadDisputes(totalUnread);
      setUnreadByDispute(unreadCounts);
    } catch (e) {
      console.error("Failed to calculate unread disputes", e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    calculateTotalUnreadDisputes();
    // Refresh unread count every 5 seconds
    const interval = setInterval(calculateTotalUnreadDisputes, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Fetching admin dashboard data...");
      
      // Fetch all users
      console.log("📥 Fetching users from /api/admin/users");
      const usersRes = await api.get("/api/admin/users");
      const allUsers = usersRes.data || [];
      console.log("✅ Users fetched:", allUsers.length, allUsers);
      setUsers(allUsers);

      // Filter by role
      setProviders(allUsers.filter(u => u.role === "PROVIDER"));
      setCustomers(allUsers.filter(u => u.role === "CUSTOMER"));

      // Fetch bookings
      console.log("📥 Fetching bookings from /api/admin/bookings");
      const bookingsRes = await api.get("/api/admin/bookings");
      console.log("✅ Bookings fetched:", bookingsRes.data?.length, bookingsRes.data);
      setBookings(bookingsRes.data || []);

      // Fetch services
      console.log("📥 Fetching services from /api/admin/services");
      const servicesRes = await api.get("/api/admin/services");
      console.log("✅ Services fetched:", servicesRes.data?.length, servicesRes.data);
      setServices(servicesRes.data || []);

      // Fetch analytics
      console.log("📥 Fetching analytics from /api/admin/analytics");
      const analyticsRes = await api.get("/api/admin/analytics");
      console.log("✅ Analytics fetched:", analyticsRes.data);
      setAnalytics(analyticsRes.data || {});

      // Fetch verification profiles
      try {
        console.log("📥 Fetching verification profiles from /api/admin/providers/verification");
        const verificationRes = await api.get("/api/admin/providers/verification");
        console.log("✅ Verification profiles fetched:", verificationRes.data);
        setVerificationProfiles(verificationRes.data || []);
      } catch (e) {
        console.error("❌ Failed to fetch verification profiles", e);
      }

      // Fetch disputes
      try {
        console.log("📥 Fetching disputes from /api/disputes/admin/all");
        const disputesRes = await api.get("/api/disputes/admin/all");
        console.log("✅ Disputes fetched:", disputesRes.data);
        setDisputes(disputesRes.data || []);
      } catch (e) {
        console.error("❌ Failed to fetch disputes", e);
      }

      // Calculate stats
      setStats({
        totalUsers: allUsers.length,
        providers: allUsers.filter(u => u.role === "PROVIDER").length,
        customers: allUsers.filter(u => u.role === "CUSTOMER").length,
        bookings: bookingsRes.data?.length || 0,
        services: servicesRes.data?.length || 0,
        pendingBookings: bookingsRes.data?.filter(b => b.status === "PENDING").length || 0
      });
      console.log("✅ Dashboard data fetched successfully");
    } catch (e) {
      const errorMsg = `Failed to fetch admin data: ${e.response?.status} ${e.response?.statusText || e.message}`;
      console.error("❌ " + errorMsg, e);
      console.error("Error details:", {
        message: e.message,
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: e.response?.data,
        config: e.config
      });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      alert("User deleted successfully");
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete user");
    }
  };


  const deleteService = async (serviceId) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await api.delete(`/api/admin/services/${serviceId}`);
      alert("Service deleted");
      fetchDashboardData();
    } catch (err) {
      alert("Failed to delete service");
    }
  };

  const makeAdmin = async (userId) => {
    if (!window.confirm("Promote this user to admin? This action cannot be undone.")) return;
    try {
      await api.post(`/api/admin/users/${userId}/make-admin`);
      alert("User promoted to admin successfully");
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to promote user");
    }
  };

  const handleVerification = async (providerId, action) => {
    const notes = prompt(`Enter notes for ${action.toLowerCase()}:`);
    if (notes === null) return; // User cancelled
    
    try {
      await api.post(`/api/admin/providers/${providerId}/verify`, { action, notes });
      alert(`Provider ${action.toLowerCase()} successfully`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update verification");
    }
  };

  const updateDispute = async (disputeId, updates) => {
    try {
      await api.patch(`/api/disputes/admin/${disputeId}`, updates);
      alert("Dispute updated successfully");
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update dispute");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading admin dashboard...</p>
          <button
            onClick={async () => {
              try {
                const res = await api.post("/api/auth/promote-to-admin");
                // Store new tokens
                if (res.data.accessToken) {
                  localStorage.setItem("accessToken", res.data.accessToken);
                }
                if (res.data.refreshToken) {
                  localStorage.setItem("refreshToken", res.data.refreshToken);
                }
                alert("Promoted to admin! Refreshing...");
                // Refresh the page to reload with new token
                window.location.reload();
              } catch (err) {
                alert("Error: " + (err.response?.data?.error || err.message));
              }
            }}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Promote to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="font-semibold text-red-800">Error Loading Dashboard</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={() => fetchDashboardData()}
                className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage platform operations and analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("disputes")}
                className="relative bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 shadow-md hover:shadow-lg transition"
              >
                ⚖️ Disputes
                {totalUnreadDisputes > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                    {totalUnreadDisputes > 9 ? "9+" : totalUnreadDisputes}
                  </span>
                )}
              </button>
              <button
                onClick={() => fetchDashboardData()}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg transition"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
            <h3 className="text-sm text-gray-500">Total Users</h3>
            <p className="text-2xl font-semibold text-gray-800">{stats?.totalUsers ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
            <h3 className="text-sm text-gray-500">Total Services</h3>
            <p className="text-2xl font-semibold text-indigo-700">{stats?.services ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
            <h3 className="text-sm text-gray-500">Total Bookings</h3>
            <p className="text-2xl font-semibold text-purple-700">{stats?.bookings ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
            <h3 className="text-sm text-gray-500">Revenue (₹)</h3>
            <p className="text-2xl font-semibold text-orange-600">
              {analytics?.totalRevenue ? analytics.totalRevenue.toFixed(2) : '0'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow mb-6 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {["overview", "analytics", "users", "providers", "verification", "services", "bookings", "disputes"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize whitespace-nowrap transition-colors relative ${
                  activeTab === tab
                    ? "border-b-2 border-indigo-600 text-indigo-700"
                    : "text-gray-600 hover:text-indigo-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{tab}</span>
                  {tab === "disputes" && totalUnreadDisputes > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {totalUnreadDisputes > 9 ? "9+" : totalUnreadDisputes}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-3">Platform Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                    <div className="text-sm text-gray-600">Completed Bookings</div>
                    <div className="text-2xl font-bold text-green-700">{analytics?.completedBookings || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                    <div className="text-sm text-gray-600">Pending Bookings</div>
                    <div className="text-2xl font-bold text-orange-700">{stats?.pendingBookings || 0}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    {bookings.slice(0, 5).map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">Booking #{b.id}</div>
                          <div className="text-sm text-gray-500">
                            Service #{b.serviceId} • Customer #{b.customerId}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          b.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                          b.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                          b.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && analytics && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">📊 Platform Analytics Dashboard</h3>

                {/* Booking Status Distribution - Pie Chart */}
                <div className="bg-white border rounded-xl p-6">
                  <h4 className="font-semibold mb-4">Booking Status Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(analytics.statusDistribution || {}).map(([name, value]) => ({
                          name,
                          value
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                        <Cell fill="#8b5cf6" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Services - Bar Chart */}
                <div className="bg-white border rounded-xl p-6">
                  <h4 className="font-semibold mb-4">📊 Most Booked Services</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topServices?.slice(0, 5) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookingCount" fill="#3b82f6" name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {analytics.topServices?.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-indigo-600">#{idx + 1}</span>
                          <div className="text-sm">{item.category} - {item.subcategory}</div>
                        </div>
                        <span className="font-semibold text-indigo-700">{item.bookingCount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Providers - Bar Chart */}
                <div className="bg-white border rounded-xl p-6">
                  <h4 className="font-semibold mb-4">⭐ Top Rated Providers</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topProviders?.slice(0, 5) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completedBookings" fill="#10b981" name="Completed Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {analytics.topProviders?.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-green-600">#{idx + 1}</span>
                          <div className="text-sm">{item.name}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-600">
                            {item.avgRating ? `⭐ ${item.avgRating.toFixed(1)}` : 'No rating'}
                          </span>
                          <span className="font-semibold text-green-700">{item.completedBookings}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Distribution - Bar Chart */}
                <div className="bg-white border rounded-xl p-6">
                  <h4 className="font-semibold mb-4">📍 Service Distribution by Location</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.locationTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="serviceCount" fill="#8b5cf6" name="Services" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="text-sm text-gray-600">Completed</div>
                    <div className="text-3xl font-bold text-green-700">{analytics?.completedBookings || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <div className="text-sm text-gray-600">Confirmed</div>
                    <div className="text-3xl font-bold text-blue-700">{analytics?.statusDistribution?.CONFIRMED || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                    <div className="text-sm text-gray-600">Pending</div>
                    <div className="text-3xl font-bold text-orange-700">{analytics?.statusDistribution?.PENDING || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
                    <div className="text-sm text-gray-600">Cancelled</div>
                    <div className="text-3xl font-bold text-red-700">{analytics?.statusDistribution?.CANCELLED || 0}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <h3 className="text-lg font-semibold mb-3">All Users ({users.length})</h3>
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="flex items-center justify-between border p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{u.name}</div>
                        <div className="text-sm text-gray-500">
                          {u.email} • <span className="font-medium">{u.role}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setChatUser({ id: u.id, name: u.name })}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm hover:from-purple-600 hover:to-pink-600"
                        >
                          💬 Chat
                        </button>
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => makeAdmin(u.id)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:from-blue-600 hover:to-indigo-700"
                          >
                            👑 Make Admin
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Providers Tab */}
            {activeTab === "providers" && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Providers ({providers.length})</h3>
                <div className="space-y-2">
                  {providers.map(p => (
                    <div key={p.id} className="flex items-center justify-between border p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{p.name}</div>
                        <div className="text-sm text-gray-500">{p.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setChatUser({ id: p.id, name: p.name })}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          💬
                        </button>
                        <button
                          onClick={() => deleteUser(p.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <div>
                <h3 className="text-lg font-semibold mb-3">All Services ({services.length})</h3>
                <div className="space-y-2">
                  {services.map(s => (
                    <div key={s.id} className="flex items-center justify-between border p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{s.category} - {s.subcategory}</div>
                        <div className="text-sm text-gray-500">
                          Provider #{s.providerId} • ₹{s.price} • {s.location}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteService(s.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div>
                <h3 className="text-lg font-semibold mb-3">All Bookings ({bookings.length})</h3>
                <div className="space-y-2">
                  {bookings.map(b => (
                    <div key={b.id} className="border p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">Booking #{b.id}</div>
                          <div className="text-sm text-gray-500">
                            Service #{b.serviceId} • Customer #{b.customerId}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          b.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                          b.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                          b.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : "N/A"} • {b.timeSlot || "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Tab */}
            {activeTab === "verification" && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Provider Verification ({verificationProfiles.length})</h3>
                <div className="space-y-3">
                  {verificationProfiles.map(profile => {
                    // Find provider user details
                    const providerUser = users.find(u => u.id === profile.providerId);
                    // Normalize status to ensure buttons show when backend returns null/undefined/lowercase
                    const status = (profile.verificationStatus || "PENDING").toUpperCase();
                    
                    return (
                      <div key={profile.id} className="border-2 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="font-bold text-lg text-gray-800">
                                {providerUser?.name || `Provider #${profile.providerId}`}
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                status === "APPROVED" ? "bg-green-100 text-green-800" :
                                status === "REJECTED" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                              }`}>
                                {status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              📧 {providerUser?.email || "N/A"}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              🏷️ Categories: {Array.isArray(profile.categories) ? profile.categories.join(", ") : profile.categories || "N/A"}
                            </div>
                            <div className="text-sm text-gray-600">
                              📍 Location: {profile.location || "N/A"}
                            </div>
                          </div>
                        </div>

                        {/* Document Section */}
                        {profile.verificationDocumentUrl ? (
                          <div className="mb-3 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                            <div className="text-xs font-semibold text-blue-700 mb-2">📄 Verification Document</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm text-blue-600 truncate" title={profile.verificationDocumentUrl}>
                                {profile.verificationDocumentUrl}
                              </div>
                              <a
                                href={profile.verificationDocumentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 whitespace-nowrap font-semibold shadow-sm hover:shadow-md transition"
                              >
                                🔍 View Document
                              </a>
                              {status !== "APPROVED" && (
                                <button
                                  onClick={() => handleVerification(profile.providerId, "APPROVED")}
                                  className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 font-semibold shadow-sm hover:shadow-md transition"
                                  title="Approve after reviewing the document"
                                >
                                  ✓ Approve
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3 p-3 bg-orange-50 border-2 border-orange-300 rounded-lg">
                            <div className="text-sm text-orange-700 font-semibold">⚠️ No document uploaded yet</div>
                            <div className="text-xs text-orange-600 mt-1">Provider needs to upload verification documents</div>
                          </div>
                        )}

                        {/* Admin Notes */}
                        {profile.verificationNotes && (
                          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="text-xs font-semibold text-gray-700 mb-1">📝 Admin Notes:</div>
                            <div className="text-sm text-gray-800">{profile.verificationNotes}</div>
                          </div>
                        )}

                        {/* Action Buttons - Always show for PENDING status */}
                        {status !== "APPROVED" && (
                          <div className="flex gap-3 mt-3">
                            <button
                              onClick={() => handleVerification(profile.providerId, "APPROVED")}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm hover:from-green-600 hover:to-emerald-700 font-bold shadow-md hover:shadow-lg transition transform hover:scale-[1.02]"
                            >
                              ✓ Approve Verification
                            </button>
                            <button
                              onClick={() => handleVerification(profile.providerId, "REJECTED")}
                              className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-red-600 font-bold shadow-md hover:shadow-lg transition transform hover:scale-[1.02]"
                            >
                              ✗ Reject Verification
                            </button>
                          </div>
                        )}

                        {/* Already Verified/Rejected Status */}
                        {status === "APPROVED" && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-sm text-green-700 font-semibold">✅ Provider is verified</div>
                            {profile.verifiedAt && (
                              <div className="text-xs text-green-600 mt-1">
                                Verified on: {new Date(profile.verifiedAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}

                        {status === "REJECTED" && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="text-sm text-red-700 font-semibold">❌ Verification rejected</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {verificationProfiles.length === 0 && (
                    <div className="text-gray-500 text-center py-8">No verification requests</div>
                  )}
                </div>
              </div>
            )}

            {/* Disputes Tab */}
            {activeTab === "disputes" && (
              <div>
                <h3 className="text-lg font-semibold mb-3">⚖️ Disputes & Reports ({disputes.length})</h3>
                <div className="space-y-4">
                  {disputes.map(dispute => {
                    const customer = customers.find(c => c.id === dispute.customerId);
                    const provider = providers.find(p => p.id === dispute.providerId);
                    
                    return (
                      <div key={dispute.id} className="border-2 p-5 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="font-bold text-lg text-gray-800">Dispute #{dispute.id}</div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                dispute.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                                dispute.status === "REJECTED" ? "bg-red-100 text-red-800" :
                                dispute.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                                "bg-yellow-100 text-yellow-800"
                              }`}>
                                {dispute.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              📋 Booking #{dispute.bookingId} • 🏷️ {dispute.category}
                            </div>
                          </div>
                        </div>

                        {/* Parties Involved */}
                        <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                          <div className="text-sm font-semibold text-gray-700 mb-3">Parties Involved:</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-xs text-gray-600 mb-1">👤 Customer</div>
                              <button
                                onClick={() => setSelectedUserProfile(dispute.customerId)}
                                className="text-blue-600 font-semibold hover:text-blue-800 hover:underline text-sm"
                              >
                                {customer?.name || `Customer #${dispute.customerId}`}
                              </button>
                              <div className="text-xs text-gray-500 mt-1">{customer?.email}</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="text-xs text-gray-600 mb-1">👨‍💼 Provider</div>
                              <button
                                onClick={() => setSelectedUserProfile(dispute.providerId)}
                                className="text-green-600 font-semibold hover:text-green-800 hover:underline text-sm"
                              >
                                {provider?.name || `Provider #${dispute.providerId}`}
                              </button>
                              <div className="text-xs text-gray-500 mt-1">{provider?.email}</div>
                            </div>
                          </div>
                        </div>

                        {/* Issue Details */}
                        <div className="mb-4">
                          <div className="font-semibold text-gray-800 mb-2">{dispute.subject}</div>
                          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{dispute.description}</div>
                        </div>

                        {/* Refund Info */}
                        {dispute.refundAmount && (
                          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="text-sm text-gray-700">
                              💰 Refund: <span className="font-bold text-orange-700">₹{dispute.refundAmount}</span> • 
                              Status: <span className={`font-semibold ${
                                dispute.refundStatus === "APPROVED" ? "text-green-700" : "text-yellow-700"
                              }`}>{dispute.refundStatus}</span>
                            </div>
                          </div>
                        )}

                        {/* Admin Notes */}
                        {dispute.adminNotes && (
                          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-xs font-semibold text-blue-700 mb-1">📝 Admin Notes:</div>
                            <div className="text-sm text-gray-800">{dispute.adminNotes}</div>
                          </div>
                        )}

                        {/* Resolution Notes */}
                        {dispute.resolutionNotes && (
                          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-xs font-semibold text-green-700 mb-1">✅ Resolution:</div>
                            <div className="text-sm text-gray-800">{dispute.resolutionNotes}</div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {dispute.status !== "RESOLVED" && dispute.status !== "REJECTED" && (
                            <>
                              <button
                                onClick={() => setSelectedGroupChat(dispute)}
                                className="relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:from-indigo-700 hover:to-blue-700 font-semibold shadow-sm hover:shadow-md transition"
                              >
                                💬 Service Chat
                                {unreadByDispute[dispute.id] > 0 && (
                                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                                    {unreadByDispute[dispute.id] > 9 ? "9+" : unreadByDispute[dispute.id]}
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  const notes = prompt("Enter resolution notes:");
                                  if (notes) updateDispute(dispute.id, { status: "RESOLVED", resolutionNotes: notes });
                                }}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:from-green-600 hover:to-emerald-700 font-semibold shadow-sm hover:shadow-md transition"
                              >
                                ✓ Resolve
                              </button>
                              <button
                                onClick={() => {
                                  const notes = prompt("Enter rejection reason:");
                                  if (notes) updateDispute(dispute.id, { status: "REJECTED", adminNotes: notes });
                                }}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 font-semibold shadow-sm hover:shadow-md transition"
                              >
                                ✗ Reject
                              </button>
                              <button
                                onClick={() => {
                                  const amount = prompt("Enter refund amount:");
                                  if (amount) updateDispute(dispute.id, { refundAmount: parseFloat(amount), refundStatus: "APPROVED" });
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 font-semibold shadow-sm hover:shadow-md transition"
                              >
                                💰 Approve Refund
                              </button>
                            </>
                          )}
                          {(dispute.status === "RESOLVED" || dispute.status === "REJECTED") && (
                            <div className="text-sm text-gray-600 italic">
                              {dispute.status === "RESOLVED" ? "✅ This dispute has been resolved" : "❌ This dispute has been rejected"}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {disputes.length === 0 && (
                    <div className="text-gray-500 text-center py-12">
                      <div className="text-4xl mb-2">✨</div>
                      <p className="text-lg">No disputes reported</p>
                      <p className="text-sm">All is well on the platform!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {chatUser && (
        <ChatWindow
          receiverId={chatUser.id}
          receiverName={chatUser.name}
          onClose={() => setChatUser(null)}
        />
      )}

      {selectedGroupChat && (
        <DisputeGroupChat
          disputeId={selectedGroupChat.id}
          customerId={selectedGroupChat.customerId}
          providerId={selectedGroupChat.providerId}
          onClose={() => setSelectedGroupChat(null)}
        />
      )}

      {selectedUserProfile && (
        <UserProfileModal
          userId={selectedUserProfile}
          onClose={() => setSelectedUserProfile(null)}
        />
      )}
    </div>
  );
}