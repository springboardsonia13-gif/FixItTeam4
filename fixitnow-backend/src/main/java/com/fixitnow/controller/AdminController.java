// package com.fixitnow.controller;

// import org.springframework.security.access.prepost.PreAuthorize;
// import com.fixitnow.model.ServiceEntity;
// import com.fixitnow.repository.ServiceRepository;
// import com.fixitnow.service.GeocodingService;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import java.util.ArrayList;
// import java.util.List;

// @RestController
// @RequestMapping("/api/admin")
// public class AdminController {

//     private final ServiceRepository serviceRepo;
//     private final GeocodingService geocodingService;

//     public AdminController(ServiceRepository serviceRepo, GeocodingService geocodingService) {
//         this.serviceRepo = serviceRepo;
//         this.geocodingService = geocodingService;
//     }

//     /**
//      * One-time endpoint to geocode services missing coordinates. Call manually.
//      * Requires `security.maps.apiKey` set in application.properties or environment.
//      */
//     @PostMapping("/geocode-services")
//     @PreAuthorize("hasRole('ADMIN')")
//     public ResponseEntity<?> geocodeMissingServices() {
//         List<ServiceEntity> missing = serviceRepo.findByLatitudeIsNullOrLongitudeIsNull();
//         List<Long> updated = new ArrayList<>();
//         for (ServiceEntity s : missing) {
//             String addr = s.getLocation();
//             if (addr == null || addr.isBlank()) continue;
//             geocodingService.geocode(addr).ifPresent(latlng -> {
//                 s.setLatitude(latlng[0]);
//                 s.setLongitude(latlng[1]);
//                 serviceRepo.save(s);
//                 updated.add(s.getId());
//             });
//         }
//         return ResponseEntity.ok("Updated coordinates for " + updated.size() + " services: " + updated);
//     }
// }


// package com.fixitnow.controller;

// import com.fixitnow.model.ServiceEntity;
// import com.fixitnow.model.User;
// import com.fixitnow.model.Booking;
// import com.fixitnow.repository.ServiceRepository;
// import com.fixitnow.repository.UserRepository;
// import com.fixitnow.repository.BookingRepository;
// import com.fixitnow.service.GeocodingService;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;

// import java.util.ArrayList;
// import java.util.List;
// import java.util.Map;

// @RestController
// @RequestMapping("/api/admin")
// @PreAuthorize("hasRole('ADMIN')")
// public class AdminController {

//     private final ServiceRepository serviceRepo;
//     private final UserRepository userRepo;
//     private final BookingRepository bookingRepo;
//     private final GeocodingService geocodingService;

//     public AdminController(ServiceRepository serviceRepo, 
//                           UserRepository userRepo, 
//                           BookingRepository bookingRepo,
//                           GeocodingService geocodingService) {
//         this.serviceRepo = serviceRepo;
//         this.userRepo = userRepo;
//         this.bookingRepo = bookingRepo;
//         this.geocodingService = geocodingService;
//     }

//     /**
//      * Get all users
//      */
//     @GetMapping("/users")
//     public ResponseEntity<?> getAllUsers() {
//         List<User> users = userRepo.findAll();
//         return ResponseEntity.ok(users);
//     }

//     /**
//      * Get all services
//      */
//     @GetMapping("/services")
//     public ResponseEntity<?> getAllServices() {
//         List<ServiceEntity> services = serviceRepo.findAll();
//         return ResponseEntity.ok(services);
//     }

//     /**
//      * Get all bookings
//      */
//     @GetMapping("/bookings")
//     public ResponseEntity<?> getAllBookings() {
//         List<Booking> bookings = bookingRepo.findAll();
//         return ResponseEntity.ok(bookings);
//     }

//     /**
//      * Delete a user
//      */
//     @DeleteMapping("/users/{id}")
//     public ResponseEntity<?> deleteUser(@PathVariable Long id) {
//         if (!userRepo.existsById(id)) {
//             return ResponseEntity.status(404).body(Map.of("error", "User not found"));
//         }
//         userRepo.deleteById(id);
//         return ResponseEntity.ok(Map.of("message", "User deleted"));
//     }

//     /**
//      * Delete a service
//      */
//     @DeleteMapping("/services/{id}")
//     public ResponseEntity<?> deleteService(@PathVariable Long id) {
//         if (!serviceRepo.existsById(id)) {
//             return ResponseEntity.status(404).body(Map.of("error", "Service not found"));
//         }
//         serviceRepo.deleteById(id);
//         return ResponseEntity.ok(Map.of("message", "Service deleted"));
//     }

//     /**
//      * Verify provider (placeholder - implement as needed)
//      */
//     @PostMapping("/providers/{id}/verify")
//     public ResponseEntity<?> verifyProvider(@PathVariable Long id) {
//         // Implement provider verification logic
//         // For now, just return success
//         return ResponseEntity.ok(Map.of("message", "Provider verified"));
//     }

//     /**
//      * One-time endpoint to geocode services missing coordinates
//      */
//     @PostMapping("/geocode-services")
//     public ResponseEntity<?> geocodeMissingServices() {
//         List<ServiceEntity> missing = serviceRepo.findByLatitudeIsNullOrLongitudeIsNull();
//         List<Long> updated = new ArrayList<>();
//         for (ServiceEntity s : missing) {
//             String addr = s.getLocation();
//             if (addr == null || addr.isBlank()) continue;
//             geocodingService.geocode(addr).ifPresent(latlng -> {
//                 s.setLatitude(latlng[0]);
//                 s.setLongitude(latlng[1]);
//                 serviceRepo.save(s);
//                 updated.add(s.getId());
//             });
//         }
//         return ResponseEntity.ok(Map.of(
//             "message", "Updated coordinates for " + updated.size() + " services",
//             "serviceIds", updated
//         ));
//     }
// }

package com.fixitnow.controller;

import com.fixitnow.model.ServiceEntity;
import com.fixitnow.model.User;
import com.fixitnow.model.Role;
import com.fixitnow.model.Booking;
import com.fixitnow.model.ProviderProfile;
import com.fixitnow.repository.ServiceRepository;
import com.fixitnow.repository.UserRepository;
import com.fixitnow.repository.BookingRepository;
import com.fixitnow.repository.ReviewRepository;
import com.fixitnow.repository.ProviderProfileRepository;
import com.fixitnow.service.GeocodingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("isAuthenticated()")
public class AdminController {

    private final ServiceRepository serviceRepo;
    private final UserRepository userRepo;
    private final BookingRepository bookingRepo;
    private final ReviewRepository reviewRepo;
    private final ProviderProfileRepository providerProfileRepo;
    private final GeocodingService geocodingService;

    public AdminController(ServiceRepository serviceRepo, 
                          UserRepository userRepo, 
                          BookingRepository bookingRepo,
                          ReviewRepository reviewRepo,
                          ProviderProfileRepository providerProfileRepo,
                          GeocodingService geocodingService) {
        this.serviceRepo = serviceRepo;
        this.userRepo = userRepo;
        this.bookingRepo = bookingRepo;
        this.reviewRepo = reviewRepo;
        this.providerProfileRepo = providerProfileRepo;
        this.geocodingService = geocodingService;
    }

    /**
     * Get all users
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepo.findAll();
        return ResponseEntity.ok(users);
    }

    /**
     * Get all services
     */
    @GetMapping("/services")
    public ResponseEntity<?> getAllServices() {
        List<ServiceEntity> services = serviceRepo.findAll();
        return ResponseEntity.ok(services);
    }

    /**
     * Get all bookings
     */
    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings() {
        List<Booking> bookings = bookingRepo.findAll();
        return ResponseEntity.ok(bookings);
    }

    /**
     * Delete a user
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepo.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        userRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    /**
     * Delete a service
     */
    @DeleteMapping("/services/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        if (!serviceRepo.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Service not found"));
        }
        serviceRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Service deleted"));
    }

    /**
     * Get all provider profiles for verification
     * GET /api/admin/providers/verification
     */
    @GetMapping("/providers/verification")
    public ResponseEntity<?> getProvidersForVerification(@RequestParam(required = false) String status) {
        List<ProviderProfile> profiles;
        if (status != null && !status.isEmpty()) {
            profiles = providerProfileRepo.findByVerificationStatus(status);
        } else {
            profiles = providerProfileRepo.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(profiles);
    }

    /**
     * Approve or reject provider verification
     * POST /api/admin/providers/{providerId}/verify
     */
    @PostMapping("/providers/{providerId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyProvider(@PathVariable Long providerId, @RequestBody Map<String, String> payload) {
        Optional<ProviderProfile> profileOpt = providerProfileRepo.findByProviderId(providerId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Provider profile not found"));
        }
        
        ProviderProfile profile = profileOpt.get();
        String action = payload.getOrDefault("action", "APPROVED"); // APPROVED or REJECTED
        String notes = payload.get("notes");
        
        profile.setVerificationStatus(action);
        profile.setVerificationNotes(notes);
        profile.setVerifiedAt(java.time.LocalDateTime.now());
        providerProfileRepo.save(profile);
        
        return ResponseEntity.ok(Map.of(
            "message", "Provider verification updated",
            "providerId", providerId,
            "status", action
        ));
    }

    /**
     * Promote user to admin role
     */
    @PostMapping("/users/{id}/make-admin")
    public ResponseEntity<?> makeUserAdmin(@PathVariable Long id) {
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        
        User user = userOpt.get();
        
        // Check if already admin
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.status(400).body(Map.of("error", "User is already an admin"));
        }
        
        // Promote to admin
        user.setRole(Role.ADMIN);
        userRepo.save(user);
        
        return ResponseEntity.ok(Map.of(
            "message", "User promoted to admin successfully",
            "userId", id,
            "newRole", "ADMIN"
        ));
    }

    /**
     * Get analytics dashboard data
     */
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        List<Booking> allBookings = bookingRepo.findAll();
        List<ServiceEntity> allServices = serviceRepo.findAll();
        
        // Most booked services
        Map<Long, Long> serviceBookingCounts = allBookings.stream()
            .collect(Collectors.groupingBy(Booking::getServiceId, Collectors.counting()));
        
        List<Map<String, Object>> topServices = serviceBookingCounts.entrySet().stream()
            .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
            .limit(10)
            .map(entry -> {
                Map<String, Object> item = new HashMap<>();
                item.put("serviceId", entry.getKey());
                item.put("bookingCount", entry.getValue());
                
                // Get service details
                serviceRepo.findById(entry.getKey()).ifPresent(service -> {
                    item.put("category", service.getCategory());
                    item.put("subcategory", service.getSubcategory());
                    item.put("location", service.getLocation());
                });
                
                return item;
            })
            .collect(Collectors.toList());

        // Top providers by booking count
        Map<Long, Long> providerBookingCounts = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.Status.COMPLETED)
            .collect(Collectors.groupingBy(Booking::getProviderId, Collectors.counting()));
        
        List<Map<String, Object>> topProviders = providerBookingCounts.entrySet().stream()
            .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
            .limit(10)
            .map(entry -> {
                Map<String, Object> item = new HashMap<>();
                item.put("providerId", entry.getKey());
                item.put("completedBookings", entry.getValue());
                
                // Get provider details
                userRepo.findById(entry.getKey()).ifPresent(user -> {
                    item.put("name", user.getName());
                    item.put("email", user.getEmail());
                });
                
                // Get average rating
                var reviews = reviewRepo.findByProviderIdOrderByCreatedAtDesc(entry.getKey());
                if (!reviews.isEmpty()) {
                    double avgRating = reviews.stream()
                        .filter(r -> r.getRating() != null)
                        .mapToInt(r -> r.getRating())
                        .average()
                        .orElse(0.0);
                    item.put("avgRating", avgRating);
                }
                
                return item;
            })
            .collect(Collectors.toList());

        // Location trends
        Map<String, Long> locationTrends = allServices.stream()
            .filter(s -> s.getLocation() != null && !s.getLocation().isBlank())
            .collect(Collectors.groupingBy(
                service -> {
                    // Extract city from location
                    String loc = service.getLocation();
                    String[] parts = loc.split(",");
                    return parts[0].trim();
                },
                Collectors.counting()
            ));

        List<Map<String, Object>> locationData = locationTrends.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(10)
            .map(entry -> {
                Map<String, Object> item = new HashMap<>();
                item.put("location", entry.getKey());
                item.put("serviceCount", entry.getValue());
                return item;
            })
            .collect(Collectors.toList());

        // Booking status distribution
        Map<String, Long> statusDistribution = allBookings.stream()
            .collect(Collectors.groupingBy(
                b -> b.getStatus().toString(),
                Collectors.counting()
            ));

        // Revenue metrics (if price is available)
        double totalRevenue = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.Status.COMPLETED)
            .mapToDouble(b -> {
                return serviceRepo.findById(b.getServiceId())
                    .map(s -> s.getPrice() != null ? s.getPrice() : 0.0)
                    .orElse(0.0);
            })
            .sum();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("topServices", topServices);
        analytics.put("topProviders", topProviders);
        analytics.put("locationTrends", locationData);
        analytics.put("statusDistribution", statusDistribution);
        analytics.put("totalRevenue", totalRevenue);
        analytics.put("totalBookings", allBookings.size());
        analytics.put("completedBookings", allBookings.stream()
            .filter(b -> b.getStatus() == Booking.Status.COMPLETED)
            .count());

        return ResponseEntity.ok(analytics);
    }

    /**
     * One-time endpoint to geocode services missing coordinates
     */
    @PostMapping("/geocode-services")
    public ResponseEntity<?> geocodeMissingServices() {
        List<ServiceEntity> missing = serviceRepo.findByLatitudeIsNullOrLongitudeIsNull();
        List<Long> updated = new ArrayList<>();
        for (ServiceEntity s : missing) {
            String addr = s.getLocation();
            if (addr == null || addr.isBlank()) continue;
            geocodingService.geocode(addr).ifPresent(latlng -> {
                s.setLatitude(latlng[0]);
                s.setLongitude(latlng[1]);
                serviceRepo.save(s);
                updated.add(s.getId());
            });
        }
        return ResponseEntity.ok(Map.of(
            "message", "Updated coordinates for " + updated.size() + " services",
            "serviceIds", updated
        ));
    }
}