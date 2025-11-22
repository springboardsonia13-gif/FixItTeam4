import React from "react";
import { useNavigate } from "react-router-dom";
import ElectricianImg from "../assets/Electrician.jpg";
import PlumberImg from "../assets/Plumber.jpg";
import CarpenterImg from "../assets/Carpenter.jpg";
import CleaningImg from "../assets/cleaning.jpg";

const services = [
  {
    title: "⚡ Electrician",
    desc: "Quick fixes & wiring solutions",
    img: ElectricianImg,
    icon: "🔌",
    color: "from-yellow-400 to-orange-500"
  },
  {
    title: "🔧 Plumbing",
    desc: "Pipes, leaks & bathroom repairs",
    img: PlumberImg,
    icon: "💧",
    color: "from-blue-400 to-cyan-500"
  },
  {
    title: "🪚 Carpenter",
    desc: "Furniture repair & woodwork",
    img: CarpenterImg,
    icon: "🪵",
    color: "from-amber-400 to-orange-600"
  },
  {
    title: "🧹 Cleaning",
    desc: "Home & office deep cleaning",
    img: CleaningImg,
    icon: "✨",
    color: "from-green-400 to-emerald-500"
  },
];

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  // Redirect to appropriate panel based on role
  const handleGetStarted = () => {
    if (!token) {
      navigate("/register");
    } else {
      switch (role) {
        case "CUSTOMER":
          navigate("/customer-panel");
          break;
        case "PROVIDER":
          navigate("/provider");
          break;
        case "ADMIN":
          navigate("/admin-dashboard");
          break;
        default:
          navigate("/customer-panel");
      }
    }
  };

  const handleBookNow = () => {
    if (!token) {
      navigate("/register");
    } else {
      switch (role) {
        case "CUSTOMER":
          navigate("/customer-panel");
          break;
        case "PROVIDER":
          navigate("/provider");
          break;
        case "ADMIN":
          navigate("/admin-dashboard");
          break;
        default:
          navigate("/customer-panel");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-8 inline-block">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              🚀 Your trusted home service partner
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Fix It <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Now</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Connect with verified professionals for all your home repair and maintenance needs. Fast, reliable, and affordable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
            </button>
            {!token && (
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-indigo-400">New App</div>
              <div className="text-sm text-gray-400">Starting with trusted local experts</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-purple-400">सुरक्षित बुकिंग</div>
              <div className="text-sm text-gray-400">Safe payments & clear tracking</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-pink-400">Real Support</div>
              <div className="text-sm text-gray-400">Chat with us whenever you need help</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-400">
              Professional solutions for every home need
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl overflow-hidden border border-slate-600 hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                </div>

                {/* Content */}
                <div className="relative p-6">
                  <div className={`text-4xl mb-3 bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                    {s.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {s.desc}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-600 group-hover:border-indigo-500 transition-colors">
                    <span className="text-indigo-400 font-semibold text-sm group-hover:text-indigo-300">
                      Learn more →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h3>
            <p className="text-lg text-indigo-100 mb-8">
              Book a professional today and get your home fixed in no time.
            </p>
            <button
              onClick={handleBookNow}
              className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-slate-700 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2024 FixitNow. All rights reserved. | Expert services. Trusted professionals. Anytime, anywhere.</p>
        </div>
      </div>
    </div>
  );
}
