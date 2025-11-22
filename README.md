📌 FixItNow — Neighborhood Service & Repair Marketplace
A Full-Stack Service Booking Platform
________________________________________
📖 Project Overview
FixItNow is a complete neighborhood service marketplace that connects residents with nearby electricians, plumbers, carpenters, appliance repair technicians, and other experts.
Customers can search by location, book instant services, chat in real-time, and leave ratings, while providers manage profiles, bookings, and history. Admins handle verification, disputes, and analytics.
________________________________________
⭐ Key Features
•	🔍 Location-based search & booking
•	📂 Service categories & subcategories
•	📅 Instant booking with time slots
•	👨‍🔧 Service provider profiles (reviews, ratings, job history)
•	💬 Real-time customer–provider chat (WebSockets)
•	📊 Booking dashboards for customers & providers
•	🛠️ Admin panel: verification, disputes, analytics
________________________________________
🧑‍💻 Tech Stack
Frontend
•	React.js
•	Tailwind CSS
Backend
•	Spring Boot (Java)
•	Spring WebSocket + STOMP
Database
•	MySQL
APIs & Authentication
•	JWT (Access + Refresh tokens)
•	Google Maps API
•	Geolocation API
________________________________________
🏗 System Architecture
The architecture includes:
•	React Frontend → Spring Boot Backend
•	Backend → MySQL database
•	Backend → Google Maps API
•	WebSocket channel for live chat
________________________________________
🧩 Core Modules
Module A: User & Service Provider Management
Module B: Service Listing & Location-based Search
Module C: Booking & Scheduling
Module D: Reviews, Ratings & Chat
Module E: Admin Panel (Verification, Disputes, Analytics)
________________________________________
🗓 8-Week Milestone Plan
Milestone 1 (Weeks 1–2): Authentication & Setup
Week 1
•	Project setup: React + Spring Boot
•	JWT login/register
•	User model (customer, provider, admin)
Week 2
•	Role-based routing
•	Location capture (Geolocation API)
•	Provider registration form
✔ Output: Login/Register UI, role dashboards, location onboarding
________________________________________
Milestone 2 (Weeks 3–4): Service Listings & Map Search
Week 3
•	DB for categories & subcategories
•	Provider service listing (pricing & availability)
Week 4
•	Map-based provider search
•	Service details + reviews
✔ Output: Full listing + Google Maps search
________________________________________
Milestone 3 (Weeks 5–6): Booking System & Interaction
Week 5
•	Booking flow
•	Provider accept/reject
•	Booking status updates
Week 6
•	Real-time chat
•	Reviews & ratings
✔ Output: Full booking cycle + chat
________________________________________
Milestone 4 (Weeks 7–8): Admin Panel & Deployment
Week 7
•	Provider verification (document upload)
•	Dispute handling
Week 8
•	Analytics dashboard
•	Final QA + deployment
✔ Output: Fully functional admin panel
________________________________________
⚙️ Installation & Setup
Backend (Spring Boot)
cd fixitnow-backend
mvn clean install
mvn spring-boot:run
Frontend (React + Tailwind)
cd fixitnow-frontend
npm install
npm start
________________________________________
🔑 Environment Variables
Backend
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/fixitnow
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
GOOGLE_MAPS_API_KEY=your_api_key
Frontend
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key
________________________________________
🗂 Database Schema (Summary)
•	users
•	providers
•	services
•	bookings
•	reviews
•	messages
•	documents
________________________________________
📡 API Endpoints (Summary)
Auth
•	POST /api/auth/register
•	POST /api/auth/login
•	POST /api/auth/refresh
Providers
•	GET /api/providers
•	GET /api/providers/{id}
Bookings
•	POST /api/bookings
•	PATCH /api/bookings/{id}
Reviews
•	POST /api/reviews
Chat (WebSocket)
•	STOMP endpoint: /ws
•	Send: /app/chat.sendMessage
•	Subscribe: /topic/conversation.{id}
________________________________________
🔐 Authentication & Security
•	JWT access + refresh tokens
•	Role-based access: customer/provider/admin
•	File upload validation
•	Server-side booking validation
________________________________________
🧪 Testing
Backend
mvn test
Frontend
npm test
________________________________________
🚀 Deployment
Backend:
mvn clean package
java -jar target/fixitnow-backend.jar
Frontend: Deploy via Vercel / Netlify / Nginx.
________________________________________
🖼 Screenshots

________________________________________

📄 License
MIT License © 2025 springboardsonia13-gif

