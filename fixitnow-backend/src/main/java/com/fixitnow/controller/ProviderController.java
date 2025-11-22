
// package com.fixitnow.controller;

// import com.fixitnow.dto.ProviderProfileRequest;
// import com.fixitnow.model.Booking;
// import com.fixitnow.model.ProviderProfile;
// import com.fixitnow.model.ServiceEntity;
// import com.fixitnow.repository.BookingRepository;
// import com.fixitnow.repository.ProviderProfileRepository;
// import com.fixitnow.repository.ServiceRepository;
// import com.fixitnow.repository.UserRepository;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.fasterxml.jackson.core.JsonProcessingException;

// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;

// import java.security.Principal;
// import java.util.*;

// @RestController
// @RequestMapping("/api/provider")
// public class ProviderController {

//     private final ProviderProfileRepository profileRepo;
//     private final BookingRepository bookingRepo;
//     private final ServiceRepository serviceRepo;
//     private final UserRepository userRepo;
//     private final ObjectMapper objectMapper = new ObjectMapper();

//     public ProviderController(ProviderProfileRepository profileRepo,
//                               BookingRepository bookingRepo,
//                               ServiceRepository serviceRepo,
//                               UserRepository userRepo) {
//         this.profileRepo = profileRepo;
//         this.bookingRepo = bookingRepo;
//         this.serviceRepo = serviceRepo;
//         this.userRepo = userRepo;
//     }

//     // ---------- Profile ----------

//     @PostMapping("/profile")
//     @PreAuthorize("hasRole('PROVIDER')")
//     public ResponseEntity<?> saveProfile(@RequestBody ProviderProfileRequest req, Principal principal) {
//         if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
//         Optional<com.fixitnow.model.User> userOpt = userRepo.findByEmail(principal.getName());
//         if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Provider not found"));
//         var user = userOpt.get();

//         var profileOpt = profileRepo.findByProviderId(user.getId());
//         ProviderProfile profile = profileOpt.orElseGet(ProviderProfile::new);
//         profile.setProviderId(user.getId());
//         // store categories as JSON string
//         try {
//             String categoriesJson = req.getCategoriesJson(); // helper returns JSON string
//             profile.setCategories(categoriesJson);
//         } catch (Exception e) {
//             profile.setCategories("[]");
//         }
//         profile.setDescription(req.getDescription());
//         profile.setLocation(req.getLocation());
//         profileRepo.save(profile);
//         return ResponseEntity.ok(Map.of("message", "Profile saved"));
//     }

//     @GetMapping("/profile")
//     @PreAuthorize("hasRole('PROVIDER')")
//     public ResponseEntity<?> getProfile(Principal principal) {
//         if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
//         Optional<com.fixitnow.model.User> userOpt = userRepo.findByEmail(principal.getName());
//         if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Provider not found"));
//         var user = userOpt.get();

//         var profileOpt = profileRepo.findByProviderId(user.getId());
//         if (profileOpt.isEmpty()) return ResponseEntity.ok(Map.of());
//         var p = profileOpt.get();

//         // try parse categories JSON to a proper list for frontend convenience
//         Object categoriesObj = new ArrayList<>();
//         try {
//             if (p.getCategories() != null) {
//                 categoriesObj = objectMapper.readValue(p.getCategories(), List.class);
//             }
//         } catch (Exception e) {
//             categoriesObj = p.getCategories() != null ? p.getCategories() : new ArrayList<>();
//         }

//         Map<String, Object> resp = new LinkedHashMap<>();
//         resp.put("id", p.getId());
//         resp.put("providerId", p.getProviderId());
//         resp.put("categories", categoriesObj);
//         resp.put("description", p.getDescription());
//         resp.put("location", p.getLocation());
//         resp.put("createdAt", p.getCreatedAt());
//         return ResponseEntity.ok(resp);
//     }

//     // ---------- Bookings ----------

//     @GetMapping("/bookings")
//     @PreAuthorize("hasRole('PROVIDER')")
//     public ResponseEntity<?> getBookings(Principal principal) {
//         if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
//         Optional<com.fixitnow.model.User> userOpt = userRepo.findByEmail(principal.getName());
//         if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Provider not found"));
//         var user = userOpt.get();

//         List<Booking> bookings = bookingRepo.findByProviderIdOrderByCreatedAtDesc(user.getId());
//         return ResponseEntity.ok(bookings);
//     }

//     @PostMapping("/bookings/{id}/{action}")
//     @PreAuthorize("hasRole('PROVIDER')")
//     public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @PathVariable String action, Principal principal) {
//         if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
//         Optional<Booking> bOpt = bookingRepo.findById(id);
//         if (bOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
//         Booking b = bOpt.get();

//         Optional<com.fixitnow.model.User> userOpt = userRepo.findByEmail(principal.getName());
//         if (userOpt.isEmpty() || !userOpt.get().getId().equals(b.getProviderId()))
//             return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));

//         if ("accept".equalsIgnoreCase(action)) {
//             b.setStatus(Booking.Status.CONFIRMED);
//         } else if ("reject".equalsIgnoreCase(action)) {
//             b.setStatus(Booking.Status.REJECTED);
//         } else if ("complete".equalsIgnoreCase(action)) {
//             b.setStatus(Booking.Status.COMPLETED);
//         } else {
//             return ResponseEntity.badRequest().body(Map.of("error", "Unknown action"));
//         }
//         bookingRepo.save(b);
//         return ResponseEntity.ok(Map.of("message", "Status updated", "status", b.getStatus()));
//     }

//     // ---------- Services (create / list / update / delete) ----------

//     @PostMapping("/services")
//     @PreAuthorize("hasRole('PROVIDER')")
//     public ResponseEntity<?> createService(@RequestBody Map<String,Object> body, Principal principal) {
//         if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
//         Optional<com.fixitnow.model.User> userOpt = userRepo.findByEmail(principal.getName());
//         if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Provider not found"));
//         var user = userOpt.get();

//         ServiceEntity s = new ServiceEntity();
//         s.setProviderId(user.getId());
//         s.setCategory((String) body.getOrDefault("category", ""));
//         s.setSubcategory((String) body.getOrDefault("subcategory", ""));
//         s.setDescription((String) body.getOrDefault("description", ""));
//         Object priceObj = body.get("price");
//         if (priceObj instanceof Number) s.setPrice(((Number) priceObj).doubleValue());
//         else if (priceObj instanceof String) {
//             try { s.setPrice(Double.parseDouble((String) priceObj)); } catch (Exception ignored) {}
//         }
//         Object avail = body.get("availability");
//         if (avail != null) {
//             try {
//                 s.setAvailability(objectMapper.writeValueAsString(avail));
//             } catch (JsonProcessingException e) {
//                 s.setAvailability(String.valueOf(avail));
//             }
//         }
//         s.setLocation((String) body.getOrDefault("location", ""));
//         serviceRepo.save(s);
//         return ResponseEntity.status(201).body(Map.of("message", "Service created", "id", s.getId()));
//     }

//     @GetMapping("/services")
//     @PreAuthorize("hasRole('PROVIDER')")
//     public ResponseEntity<?> listMyServices(Principal principal) {
//         if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
//         Optional<com.fixitnow.model.User> userOpt = userRepo.findByEmail(principal.getName());
//         if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Provider not found"));
//         var user = userOpt.get();

//         List<ServiceEntity> list = serviceRepo.findByProviderId(user.getId());
//         return ResponseEntity.ok(list);
//     }

//     @PutMapping("/services/{id}")
//     @PreAuthorize("hasRole('PROVIDER')")
//     public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody Map<String,Object> body, Principal principal) {
//         if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
//         Optional<ServiceEntity> opt = serviceRepo.findById(id);
//         if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Service not found"));
//         ServiceEntity s = opt.get();

//         var userOpt = userRepo.findByEmail(principal.getName());
//         if (userOpt.isEmpty() || !userOpt.get().getId().equals(s.getProviderId()))
//             return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));

//         s.setCategory((String) body.getOrDefault("category", s.getCategory()));
//         s.setSubcategory((String) body.getOrDefault("subcategory", s.getSubcategory()));
//         s.setDescription((String) body.getOrDefault("description", s.getDescription()));
//         Object priceObj = body.get("price");
//         if (priceObj instanceof Number) s.setPrice(((Number) priceObj).doubleValue());
//         else if (priceObj instanceof String) {
//             try { s.setPrice(Double.parseDouble((String) priceObj)); } catch (Exception ignored) {}
//         }
//         Object avail = body.get("availability");
//         if (avail != null) {
//             try { s.setAvailability(objectMapper.writeValueAsString(avail)); } catch (Exception e) { s.setAvailability(String.valueOf(avail)); }
//         }
//         s.setLocation((String) body.getOrDefault("location", s.getLocation()));
//         serviceRepo.save(s);
//         return ResponseEntity.ok(Map.of("message", "Service updated"));
//     }

//     @DeleteMapping("/services/{id}")
//     @PreAuthorize("hasRole('PROVIDER')")
//     public ResponseEntity<?> deleteService(@PathVariable Long id, Principal principal) {
//         if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
//         Optional<ServiceEntity> opt = serviceRepo.findById(id);
//         if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Service not found"));
//         ServiceEntity s = opt.get();

//         var userOpt = userRepo.findByEmail(principal.getName());
//         if (userOpt.isEmpty() || !userOpt.get().getId().equals(s.getProviderId()))
//             return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));

//         serviceRepo.delete(s);
//         return ResponseEntity.ok(Map.of("message", "Service deleted"));
//     }
// }
package com.fixitnow.controller;

import com.fixitnow.dto.ProviderProfileRequest;
import com.fixitnow.model.Booking;
import com.fixitnow.model.ProviderProfile;
import com.fixitnow.model.ServiceEntity;
import com.fixitnow.repository.BookingRepository;
import com.fixitnow.repository.ProviderProfileRepository;
import com.fixitnow.repository.ServiceRepository;
import com.fixitnow.repository.UserRepository;
import com.fixitnow.service.GeocodingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/provider")
public class ProviderController {

    private final ProviderProfileRepository profileRepo;
    private final BookingRepository bookingRepo;
    private final ServiceRepository serviceRepo;
    private final UserRepository userRepo;
    private final GeocodingService geocodingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProviderController(ProviderProfileRepository profileRepo,
                              BookingRepository bookingRepo,
                              ServiceRepository serviceRepo,
                              UserRepository userRepo,
                              GeocodingService geocodingService) {
        this.profileRepo = profileRepo;
        this.bookingRepo = bookingRepo;
        this.serviceRepo = serviceRepo;
        this.userRepo = userRepo;
        this.geocodingService = geocodingService;
    }

    // ---------- Profile ----------

    @PostMapping("/profile")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> saveProfile(@RequestBody ProviderProfileRequest req, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        Optional<com.fixitnow.model.User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Provider not found"));
        var user = userOpt.get();

        var profileOpt = profileRepo.findByProviderId(user.getId());
        ProviderProfile profile = profileOpt.orElseGet(ProviderProfile::new);
        profile.setProviderId(user.getId());
        try {
            String categoriesJson = req.getCategoriesJson();
            profile.setCategories(categoriesJson);
        } catch (Exception e) {
            profile.setCategories("[]");
        }
        profile.setDescription(req.getDescription());
        profile.setLocation(req.getLocation());
        if (req.getVerificationDocumentUrl() != null) {
            profile.setVerificationDocumentUrl(req.getVerificationDocumentUrl());
        }
        profileRepo.save(profile);
        return ResponseEntity.ok(Map.of("message", "Profile saved"));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getProfile(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        Optional<com.fixitnow.model.User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Provider not found"));
        var user = userOpt.get();

        var profileOpt = profileRepo.findByProviderId(user.getId());
        if (profileOpt.isEmpty()) return ResponseEntity.ok(Map.of());
        var p = profileOpt.get();

        Object categoriesObj = new ArrayList<>();
        try {
            if (p.getCategories() != null) {
                categoriesObj = objectMapper.readValue(p.getCategories(), List.class);
            }
        } catch (Exception e) {
            categoriesObj = p.getCategories() != null ? p.getCategories() : new ArrayList<>();
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id", p.getId());
        resp.put("providerId", p.getProviderId());
        resp.put("categories", categoriesObj);
        resp.put("description", p.getDescription());
        resp.put("location", p.getLocation());
        resp.put("verificationStatus", p.getVerificationStatus());
        resp.put("verificationDocumentUrl", p.getVerificationDocumentUrl());
        resp.put("verificationNotes", p.getVerificationNotes());
        resp.put("verifiedAt", p.getVerifiedAt());
        resp.put("createdAt", p.getCreatedAt());
        return ResponseEntity.ok(resp);
    }

    // ---------- Bookings ----------

    @GetMapping("/bookings")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getBookings(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        Optional<com.fixitnow.model.User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Provider not found"));
        var user = userOpt.get();

        List<Booking> bookings = bookingRepo.findByProviderIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(bookings);
    }

    @PostMapping("/bookings/{id}/{action}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @PathVariable String action, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        Optional<Booking> bOpt = bookingRepo.findById(id);
        if (bOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        Booking b = bOpt.get();

        Optional<com.fixitnow.model.User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty() || !userOpt.get().getId().equals(b.getProviderId()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));

        if ("accept".equalsIgnoreCase(action)) {
            b.setStatus(Booking.Status.CONFIRMED);
        } else if ("reject".equalsIgnoreCase(action)) {
            b.setStatus(Booking.Status.REJECTED);
        } else if ("complete".equalsIgnoreCase(action)) {
            b.setStatus(Booking.Status.COMPLETED);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown action"));
        }
        bookingRepo.save(b);
        return ResponseEntity.ok(Map.of("message", "Status updated", "status", b.getStatus()));
    }

    // ---------- Services (create / list / update / delete) ----------

    @PostMapping("/services")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> createService(@RequestBody Map<String,Object> body, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        Optional<com.fixitnow.model.User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Provider not found"));
        var user = userOpt.get();

        ServiceEntity s = new ServiceEntity();
        s.setProviderId(user.getId());
        s.setCategory((String) body.getOrDefault("category", ""));
        s.setSubcategory((String) body.getOrDefault("subcategory", ""));
        s.setDescription((String) body.getOrDefault("description", ""));

        Object priceObj = body.get("price");
        if (priceObj instanceof Number) s.setPrice(((Number) priceObj).doubleValue());
        else if (priceObj instanceof String) {
            try { s.setPrice(Double.parseDouble((String) priceObj)); } catch (Exception ignored) {}
        }

        Object avail = body.get("availability");
        if (avail != null) {
            try {
                s.setAvailability(objectMapper.writeValueAsString(avail));
            } catch (JsonProcessingException e) {
                s.setAvailability(String.valueOf(avail));
            }
        }

        String location = (String) body.getOrDefault("location", "");
        // Treat location as user-provided human-readable name only
        s.setLocation(location);

        // Prefer client-provided coordinates if present
        Double latitude = null;
        Double longitude = null;
        if (body.get("latitude") != null) {
            try { latitude = Double.valueOf(body.get("latitude").toString()); } catch (Exception ignored) {}
        }
        if (body.get("longitude") != null) {
            try { longitude = Double.valueOf(body.get("longitude").toString()); } catch (Exception ignored) {}
        }

        if (latitude != null && longitude != null) {
            s.setLatitude(latitude);
            s.setLongitude(longitude);
        } else if (location != null && !location.isBlank()) {
            // Only geocode when lat/lng are missing
            geocodingService.geocode(location).ifPresent(latlng -> {
                s.setLatitude(latlng[0]);
                s.setLongitude(latlng[1]);
                System.out.println("✅ Geocoded service location: " + location + " -> [" + latlng[0] + ", " + latlng[1] + "]");
            });
        }

        serviceRepo.save(s);
        return ResponseEntity.status(201).body(Map.of("message", "Service created", "id", s.getId()));
    }

    @GetMapping("/services")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> listMyServices(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        Optional<com.fixitnow.model.User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Provider not found"));
        var user = userOpt.get();

        List<ServiceEntity> list = serviceRepo.findByProviderId(user.getId());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/services/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody Map<String,Object> body, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        Optional<ServiceEntity> opt = serviceRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Service not found"));
        ServiceEntity s = opt.get();

        var userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty() || !userOpt.get().getId().equals(s.getProviderId()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));

        s.setCategory((String) body.getOrDefault("category", s.getCategory()));
        s.setSubcategory((String) body.getOrDefault("subcategory", s.getSubcategory()));
        s.setDescription((String) body.getOrDefault("description", s.getDescription()));
        
        Object priceObj = body.get("price");
        if (priceObj instanceof Number) s.setPrice(((Number) priceObj).doubleValue());
        else if (priceObj instanceof String) {
            try { s.setPrice(Double.parseDouble((String) priceObj)); } catch (Exception ignored) {}
        }
        
        Object avail = body.get("availability");
        if (avail != null) {
            try { s.setAvailability(objectMapper.writeValueAsString(avail)); } 
            catch (Exception e) { s.setAvailability(String.valueOf(avail)); }
        }
        
        // Handle location and coordinates update
        String newLocation = (String) body.get("location");
        Double newLatitude = null;
        Double newLongitude = null;
        if (body.get("latitude") != null) {
            try { newLatitude = Double.valueOf(body.get("latitude").toString()); } catch (Exception ignored) {}
        }
        if (body.get("longitude") != null) {
            try { newLongitude = Double.valueOf(body.get("longitude").toString()); } catch (Exception ignored) {}
        }

        if (newLocation != null) {
            String oldLocation = s.getLocation();
            // Keep user-provided location text as-is
            s.setLocation(newLocation);

            if (newLatitude != null && newLongitude != null) {
                // Client provided precise coordinates; use them directly
                s.setLatitude(newLatitude);
                s.setLongitude(newLongitude);
            } else if (!newLocation.isBlank() && (oldLocation == null || !oldLocation.equals(newLocation))) {
                // Only geocode if location text actually changed and no lat/lng were provided
                geocodingService.geocode(newLocation).ifPresent(latlng -> {
                    s.setLatitude(latlng[0]);
                    s.setLongitude(latlng[1]);
                    System.out.println("✅ Re-geocoded service location: " + newLocation + " -> [" + latlng[0] + ", " + latlng[1] + "]");
                });
            }
        } else if (newLatitude != null && newLongitude != null) {
            // Location name unchanged but coordinates explicitly updated
            s.setLatitude(newLatitude);
            s.setLongitude(newLongitude);
        }

        serviceRepo.save(s);
        return ResponseEntity.ok(Map.of("message", "Service updated"));
    }

    @DeleteMapping("/services/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> deleteService(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        Optional<ServiceEntity> opt = serviceRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Service not found"));
        ServiceEntity s = opt.get();

        var userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty() || !userOpt.get().getId().equals(s.getProviderId()))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));

        serviceRepo.delete(s);
        return ResponseEntity.ok(Map.of("message", "Service deleted"));
    }
}