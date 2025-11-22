// package com.fixitnow.controller;

// import com.fixitnow.config.AuthUser;
// import com.fixitnow.model.Booking;
// import com.fixitnow.repository.BookingRepository;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;
// import java.util.Map;
// import java.util.Optional;

// @RestController
// @RequestMapping("/api/customer")
// @PreAuthorize("hasRole('CUSTOMER')")
// public class CustomerController {

//     private final BookingRepository bookingRepo;

//     public CustomerController(BookingRepository bookingRepo) {
//         this.bookingRepo = bookingRepo;
//     }

//     /**
//      * Get all bookings for the logged-in customer
//      * GET /api/customer/bookings
//      */
//     @GetMapping("/bookings")
//     public ResponseEntity<?> getMyBookings(@AuthUser Long customerId) {
//         List<Booking> bookings = bookingRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
//         return ResponseEntity.ok(bookings);
//     }

//     /**
//      * Cancel a booking (only if PENDING or CONFIRMED)
//      * POST /api/customer/bookings/{id}/cancel
//      */
//     @PostMapping("/bookings/{id}/cancel")
//     public ResponseEntity<?> cancelBooking(@PathVariable Long id, @AuthUser Long customerId) {
//         Optional<Booking> bookingOpt = bookingRepo.findById(id);
//         if (bookingOpt.isEmpty()) {
//             return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
//         }

//         Booking booking = bookingOpt.get();

//         // Verify customer owns this booking
//         if (!booking.getCustomerId().equals(customerId)) {
//             return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Not your booking"));
//         }

//         // Can only cancel PENDING or CONFIRMED bookings
//         if (booking.getStatus() != Booking.Status.PENDING && 
//             booking.getStatus() != Booking.Status.CONFIRMED) {
//             return ResponseEntity.status(400).body(Map.of(
//                 "error", "Can only cancel PENDING or CONFIRMED bookings"
//             ));
//         }

//         booking.setStatus(Booking.Status.CANCELLED);
//         bookingRepo.save(booking);

//         return ResponseEntity.ok(Map.of(
//             "message", "Booking cancelled successfully",
//             "status", booking.getStatus()
//         ));
//     }

//     /**
//      * Get a specific booking by ID (only if it belongs to the customer)
//      * GET /api/customer/bookings/{id}
//      */
//     @GetMapping("/bookings/{id}")
//     public ResponseEntity<?> getBookingById(@PathVariable Long id, @AuthUser Long customerId) {
//         Optional<Booking> bookingOpt = bookingRepo.findById(id);
//         if (bookingOpt.isEmpty()) {
//             return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
//         }

//         Booking booking = bookingOpt.get();

//         // Verify customer owns this booking
//         if (!booking.getCustomerId().equals(customerId)) {
//             return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Not your booking"));
//         }

//         return ResponseEntity.ok(booking);
//     }
// }
package com.fixitnow.controller;

import com.fixitnow.config.AuthUser;
import com.fixitnow.model.Booking;
import com.fixitnow.repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    private final BookingRepository bookingRepo;

    public CustomerController(BookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    /**
     * Get all bookings for the logged-in customer
     * GET /api/customer/bookings
     */
    @GetMapping("/bookings")
    public ResponseEntity<?> getMyBookings(@AuthUser Long customerId) {
        List<Booking> bookings = bookingRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Cancel a booking (only if PENDING or CONFIRMED)
     * POST /api/customer/bookings/{id}/cancel
     */
    @PostMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, @AuthUser Long customerId) {
        Optional<Booking> bookingOpt = bookingRepo.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }

        Booking booking = bookingOpt.get();

        // Verify customer owns this booking
        if (!booking.getCustomerId().equals(customerId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Not your booking"));
        }

        // Can only cancel PENDING or CONFIRMED bookings
        if (booking.getStatus() != Booking.Status.PENDING && 
            booking.getStatus() != Booking.Status.CONFIRMED) {
            return ResponseEntity.status(400).body(Map.of(
                "error", "Can only cancel PENDING or CONFIRMED bookings"
            ));
        }

        booking.setStatus(Booking.Status.CANCELLED);
        bookingRepo.save(booking);

        return ResponseEntity.ok(Map.of(
            "message", "Booking cancelled successfully",
            "status", booking.getStatus()
        ));
    }

    /**
     * Mark booking as complete (customer side)
     * POST /api/customer/bookings/{id}/complete
     */
    @PostMapping("/bookings/{id}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable Long id, @AuthUser Long customerId) {
        Optional<Booking> bookingOpt = bookingRepo.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }

        Booking booking = bookingOpt.get();

        // Verify customer owns this booking
        if (!booking.getCustomerId().equals(customerId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Not your booking"));
        }

        // Can only complete CONFIRMED bookings
        if (booking.getStatus() != Booking.Status.CONFIRMED) {
            return ResponseEntity.status(400).body(Map.of(
                "error", "Can only mark CONFIRMED bookings as complete"
            ));
        }

        booking.setStatus(Booking.Status.COMPLETED);
        bookingRepo.save(booking);

        return ResponseEntity.ok(Map.of(
            "message", "Booking marked as completed",
            "status", booking.getStatus()
        ));
    }

    /**
     * Get a specific booking by ID (only if it belongs to the customer)
     * GET /api/customer/bookings/{id}
     */
    @GetMapping("/bookings/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id, @AuthUser Long customerId) {
        Optional<Booking> bookingOpt = bookingRepo.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }

        Booking booking = bookingOpt.get();

        // Verify customer owns this booking
        if (!booking.getCustomerId().equals(customerId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Not your booking"));
        }

        return ResponseEntity.ok(booking);
    }
}