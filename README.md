📌 FixItNow – Neighborhood Service & Repair Marketplace

A Full-Stack Service Booking Platform


📖 Project Overview

FixItNow is a full-stack neighborhood service marketplace that connects residents with nearby electricians, plumbers, carpenters, appliance repair professionals, and other service experts. The platform allows customers to search nearby providers, book instant services, chat in real-time, and leave ratings and reviews. Providers can manage their profiles, bookings, and service history, while admins monitor verification, disputes, and platform analytics.




⭐ Key Features

Location-based search & booking (electricians, plumbers, carpenters, etc.)

Service categories & subcategories

Instant booking with time slots

Service provider profiles with reviews, ratings, completed jobs

Real-time customer–provider chat

Booking dashboards for customers & providers

Admin panel for verification, disputes, analytics


🧑‍💻 Tech Stack

Frontend

React.js

Tailwind CSS

Backend

Spring Boot (Java)

WebSockets (Spring WebSocket + STOMP)

Database

MySQL

APIs & Authentication

JWT (Access + Refresh tokens)

Google Maps API

Geolocation API

🏗 System Architecture

The architecture diagram (on page 2) clearly shows how the frontend interacts with the backend modules such as User Management, Booking System, Reviews, Admin Panel, and Location Search via MySQL and Google Maps.




Core Modules:

Module A: User & Service Provider Management

Module B: Service Listing & Location-based Search

Module C: Booking & Scheduling

Module D: Reviews, Ratings & Chat

Module E: Admin Panel (Verification, Disputes, Analytics)


🗓 8-Week Milestone Plan


Milestone 1 (Weeks 1–2): Authentication & Setup

Week 1

Setup project architecture (React + Spring Boot)

Implement JWT login/register

Create user model (customer, provider, admin)

Week 2

Role-based routing (dashboards for all roles)

Capture location (Geolocation API)

Provider registration form (category, skills, service area)

✔ Expected Output

Login/Register UI

Role-based UI

Location-aware onboarding

Milestone 2 (Weeks 3–4): Service Listings & Map Search

Week 3

Create DB structure for categories & subcategories

Providers list services with pricing & availability

Customers browse by category & location

Week 4

Google Maps–based provider search

Service detail page + booking form

Show provider reviews & ratings

✔ Expected Output

Fully functional service listing

Map search integration

Milestone 3 (Weeks 5–6): Booking System & Interaction

Week 5

Booking request system with time slots

Provider accept/reject

Booking statuses (Pending, Confirmed, Completed, Cancelled)

Week 6

Real-time chat (WebSockets)

Review & rating after completion

✔ Expected Output

Full booking cycle

Live chat

Milestone 4 (Weeks 7–8): Admin Panel & Deployment

Week 7

Admin verification of providers (document upload)

Dispute resolution workflow

Week 8

Analytics dashboard (top providers, trends)

Final deployment & QA

✔ Expected Output

Fully functional admin panel

Dispute resolution

Analytics dashboard




⚙️ Installation & Setup
Backend (Spring Boot)
cd fixitnow-backend
mvn clean install
mvn spring-boot:run

Frontend (React + Tailwind)
cd fixitnow-frontend
npm install
npm start