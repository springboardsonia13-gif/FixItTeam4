package com.fixitnow.controller;

import com.fixitnow.model.ServiceEntity;
import com.fixitnow.repository.ServiceRepository;
import com.fixitnow.repository.UserRepository;
import com.fixitnow.repository.ProviderProfileRepository;
import com.fixitnow.repository.ReviewRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceRepository serviceRepo;
    private final UserRepository userRepo;
    private final ProviderProfileRepository providerProfileRepo;
    private final ReviewRepository reviewRepo;

    public ServiceController(ServiceRepository serviceRepo, UserRepository userRepo, ProviderProfileRepository providerProfileRepo, ReviewRepository reviewRepo) {
        this.serviceRepo = serviceRepo;
        this.userRepo = userRepo;
        this.providerProfileRepo = providerProfileRepo;
        this.reviewRepo = reviewRepo;
    }

    /**
     * GET /api/services
     * optional query params:
     *   category, q (search text), location, sort (price_asc, price_desc, recent)
     */
    @GetMapping
    public ResponseEntity<?> findServices(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String location,
            @RequestParam(required = false, defaultValue = "recent") String sort,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "10") Double radiusKm
    ){
        List<ServiceEntity> all = serviceRepo.findAll();

        // filter in memory (OK for small dataset). If dataset large, write custom JPQL queries.
        List<ServiceEntity> filtered = all.stream().filter(s -> {
            boolean ok = true;
            if (category != null && !category.isBlank()) ok = ok && category.equalsIgnoreCase(s.getCategory());
            if (location != null && !location.isBlank()) ok = ok && s.getLocation() != null && s.getLocation().toLowerCase().contains(location.toLowerCase());
            if (q != null && !q.isBlank()) {
                String text = (s.getCategory() + " " + s.getSubcategory() + " " + s.getDescription()).toLowerCase();
                ok = ok && text.contains(q.toLowerCase());
            }
            return ok;
        }).collect(Collectors.toList());

        // if lat/lng provided, compute distance and filter by radius
        Map<Long, Double> distances = new HashMap<>();
        if (lat != null && lng != null) {
            filtered = filtered.stream().filter(s -> s.getLatitude() != null && s.getLongitude() != null).collect(Collectors.toList());
            for (ServiceEntity s : filtered) {
                double d = haversineDistanceKm(lat, lng, s.getLatitude(), s.getLongitude());
                distances.put(s.getId(), d);
            }
            double r = Optional.ofNullable(radiusKm).orElse(10.0);
            filtered = filtered.stream().filter(s -> distances.getOrDefault(s.getId(), Double.MAX_VALUE) <= r).collect(Collectors.toList());
        }

        // sort
        if ("price_asc".equals(sort)) filtered.sort(Comparator.comparing(s -> Optional.ofNullable(s.getPrice()).orElse(Double.MAX_VALUE)));
        else if ("price_desc".equals(sort)) filtered.sort(Comparator.comparing((ServiceEntity s) -> Optional.ofNullable(s.getPrice()).orElse(0.0)).reversed());
        else filtered.sort(Comparator.comparing(ServiceEntity::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));

        // map provider name (join user)
        List<Map<String,Object>> out = filtered.stream().map(s -> {
            Map<String,Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("category", s.getCategory());
            m.put("subcategory", s.getSubcategory());
            m.put("description", s.getDescription());
            m.put("price", s.getPrice());
            m.put("availability", s.getAvailability());
            m.put("location", s.getLocation());
            m.put("latitude", s.getLatitude());
            m.put("longitude", s.getLongitude());
            m.put("createdAt", s.getCreatedAt());
            m.put("providerId", s.getProviderId());
            if (distances.containsKey(s.getId())) m.put("distanceKm", distances.get(s.getId()));
            // provider name and verification status
            userRepo.findById(s.getProviderId()).ifPresent(u -> m.put("providerName", u.getName()));
            providerProfileRepo.findByProviderId(s.getProviderId()).ifPresent(pp -> {
                m.put("providerVerified", "APPROVED".equals(pp.getVerificationStatus()));
                m.put("providerVerificationStatus", pp.getVerificationStatus());
            });
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(out);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getService(@PathVariable Long id){
        return serviceRepo.findById(id)
                .map(s -> {
                    Map<String,Object> m = new HashMap<>();
                    m.put("id", s.getId());
                    m.put("category", s.getCategory());
                    m.put("subcategory", s.getSubcategory());
                    m.put("description", s.getDescription());
                    m.put("price", s.getPrice());
                    m.put("availability", s.getAvailability());
                    m.put("location", s.getLocation());
                    m.put("createdAt", s.getCreatedAt());
                    m.put("latitude", s.getLatitude());
                    m.put("longitude", s.getLongitude());

                    // provider basic info
                    userRepo.findById(s.getProviderId()).ifPresent(u -> {
                        m.put("providerName", u.getName());
                        m.put("providerEmail", u.getEmail());
                    });

                    // provider profile
                    providerProfileRepo.findByProviderId(s.getProviderId()).ifPresent(pp -> {
                        m.put("providerProfileDescription", pp.getDescription());
                        m.put("providerProfileCategories", pp.getCategories());
                        m.put("providerProfileLocation", pp.getLocation());
                        m.put("providerVerified", "APPROVED".equals(pp.getVerificationStatus()));
                        m.put("providerVerificationStatus", pp.getVerificationStatus());
                    });

                    // reviews & average
                    List<com.fixitnow.model.Review> reviews = reviewRepo.findByProviderIdOrderByCreatedAtDesc(s.getProviderId());
                    double avg = 0.0;
                    if (!reviews.isEmpty()) {
                        avg = reviews.stream().filter(r -> r.getRating() != null).mapToInt(r -> r.getRating()).average().orElse(0.0);
                    }
                    m.put("reviews", reviews);
                    m.put("avgRating", avg);

                    return ResponseEntity.ok(m);
                }).orElseGet(() -> ResponseEntity.status(404).body(Map.of("error","Service not found")));
    }

    // Haversine formula (distance in kilometers)
    private double haversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
