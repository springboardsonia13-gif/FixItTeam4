

package com.fixitnow.controller;

import com.fixitnow.config.AuthUser;
import com.fixitnow.model.Booking;
import com.fixitnow.model.Review;
import com.fixitnow.repository.BookingRepository;
import com.fixitnow.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepo;
    private final BookingRepository bookingRepo;

    public ReviewController(ReviewRepository reviewRepo, BookingRepository bookingRepo) {
        this.reviewRepo = reviewRepo;
        this.bookingRepo = bookingRepo;
    }

    /**
     * Create a review (only by CUSTOMER after booking is COMPLETED)
     * POST /api/reviews
     * Body: { bookingId, rating (1-5), comment }
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> body, @AuthUser Long customerId) {
        try {
            Long bookingId = Long.valueOf(body.get("bookingId").toString());
            Integer rating = Integer.valueOf(body.get("rating").toString());
            String comment = body.getOrDefault("comment", "").toString();

            // Validate rating
            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rating must be between 1 and 5"));
            }

            // Check booking exists and belongs to customer
            Optional<Booking> bookingOpt = bookingRepo.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
            }
            Booking booking = bookingOpt.get();

            // Verify customer owns this booking
            if (!booking.getCustomerId().equals(customerId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Not your booking"));
            }

            // Check booking is completed
            if (booking.getStatus() != Booking.Status.COMPLETED) {
                return ResponseEntity.status(400).body(Map.of("error", "Can only review completed bookings"));
            }

            // Check if review already exists for this booking
            List<Review> existing = reviewRepo.findByBookingId(bookingId);
            if (!existing.isEmpty()) {
                return ResponseEntity.status(409).body(Map.of("error", "Review already exists for this booking"));
            }

            // ✅ Create review WITH serviceId from booking
            Review review = new Review();
            review.setBookingId(bookingId);
            review.setCustomerId(customerId);
            review.setProviderId(booking.getProviderId());
            review.setServiceId(booking.getServiceId()); // ✅ ADDED THIS LINE
            review.setRating(rating);
            review.setComment(comment);

            Review saved = reviewRepo.save(review);
            return ResponseEntity.status(201).body(Map.of(
                "message", "Review created successfully",
                "reviewId", saved.getId()
            ));

        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Handle unique constraint violation (one review per booking)
            if (e.getMessage().contains("UK_REVIEW_BOOKING_ID") || e.getMessage().contains("booking_id")) {
                return ResponseEntity.status(409).body(Map.of("error", "You have already reviewed this booking. One review per booking is allowed."));
            }
            return ResponseEntity.status(409).body(Map.of("error", "Database constraint violation: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request: " + e.getMessage()));
        }
    }

    /**
     * Get reviews for a specific provider
     * GET /api/reviews/provider/{providerId}
     */
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<?> getProviderReviews(@PathVariable Long providerId) {
        List<Review> reviews = reviewRepo.findByProviderIdOrderByCreatedAtDesc(providerId);
        
        // Calculate average rating
        double avgRating = 0.0;
        if (!reviews.isEmpty()) {
            avgRating = reviews.stream()
                .filter(r -> r.getRating() != null)
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        }

        return ResponseEntity.ok(Map.of(
            "reviews", reviews,
            "avgRating", avgRating,
            "totalReviews", reviews.size()
        ));
    }

    /**
     * Get reviews for a specific service
     * GET /api/reviews/service/{serviceId}
     */
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<?> getServiceReviews(@PathVariable Long serviceId) {
        List<Review> reviews = reviewRepo.findByServiceIdOrderByCreatedAtDesc(serviceId);
        
        double avgRating = 0.0;
        if (!reviews.isEmpty()) {
            avgRating = reviews.stream()
                .filter(r -> r.getRating() != null)
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        }

        return ResponseEntity.ok(Map.of(
            "reviews", reviews,
            "avgRating", avgRating,
            "totalReviews", reviews.size()
        ));
    }

    /**
     * Get reviews by customer (their own reviews)
     * GET /api/reviews/my-reviews
     */
    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getMyReviews(@AuthUser Long customerId) {
        List<Review> reviews = reviewRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return ResponseEntity.ok(reviews);
    }

    /**
 * Get review for a specific booking
 * GET /api/reviews/booking/{bookingId}
 */
@GetMapping("/booking/{bookingId}")
public ResponseEntity<?> getBookingReview(@PathVariable Long bookingId) {
    List<Review> reviews = reviewRepo.findByBookingId(bookingId);
    if (reviews.isEmpty()) {
        return ResponseEntity.status(404).body(Map.of("error", "No review found for this booking"));
    }
    return ResponseEntity.ok(reviews.get(0)); // Return first review
}
}