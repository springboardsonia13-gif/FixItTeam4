package com.fixitnow.controller;

import com.fixitnow.config.AuthUser;
import com.fixitnow.model.Booking;
import com.fixitnow.model.ServiceEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com.fixitnow.repository.BookingRepository;
import com.fixitnow.repository.ServiceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@PreAuthorize("hasRole('CUSTOMER')")
public class BookingController {

    private final BookingRepository bookingRepo;
    private final ServiceRepository serviceRepo;

    public BookingController(BookingRepository bookingRepo, ServiceRepository serviceRepo) {
        this.bookingRepo = bookingRepo;
        this.serviceRepo = serviceRepo;
    }

    /**
     * Create a booking.
     * Expects JSON: { serviceId, customerId, bookingDate (YYYY-MM-DD), timeSlot, notes, customerLatitude, customerLongitude }
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> body, @AuthUser Long customerId) {
        try {
            Long serviceId = Long.valueOf(body.get("serviceId").toString());
            String bookingDateStr = body.get("bookingDate").toString();
            String timeSlot = body.get("timeSlot").toString();
            String notes = body.getOrDefault("notes", "").toString();
            
            // Extract customer location coordinates
            Double customerLatitude = null;
            Double customerLongitude = null;
            if (body.containsKey("customerLatitude") && body.get("customerLatitude") != null) {
                customerLatitude = Double.valueOf(body.get("customerLatitude").toString());
            }
            if (body.containsKey("customerLongitude") && body.get("customerLongitude") != null) {
                customerLongitude = Double.valueOf(body.get("customerLongitude").toString());
            }

            ServiceEntity service = serviceRepo.findById(serviceId).orElse(null);
            if (service == null) return ResponseEntity.status(404).body(Map.of("error","Service not found"));

            Long providerId = service.getProviderId();

            LocalDate bookingDate = LocalDate.parse(bookingDateStr);

            // check conflict: existing bookings for same provider, same date and timeSlot that are not CANCELLED or REJECTED
            List<Booking> existing = bookingRepo.findByProviderIdOrderByCreatedAtDesc(providerId);
            boolean conflict = existing.stream().anyMatch(b -> b.getBookingDate() != null && b.getBookingDate().equals(bookingDate)
                    && b.getTimeSlot() != null && b.getTimeSlot().equalsIgnoreCase(timeSlot)
                    && b.getStatus() != Booking.Status.CANCELLED && b.getStatus() != Booking.Status.REJECTED);

            if (conflict) return ResponseEntity.status(409).body(Map.of("error","Time slot not available"));

            Booking booking = new Booking();
            booking.setServiceId(serviceId);
            booking.setCustomerId(customerId);
            booking.setProviderId(providerId);
            booking.setBookingDate(bookingDate);
            booking.setTimeSlot(timeSlot);
            booking.setNotes(notes);
            booking.setCustomerLatitude(customerLatitude);
            booking.setCustomerLongitude(customerLongitude);
            booking.setStatus(Booking.Status.PENDING);

            Booking saved = bookingRepo.save(booking);

            return ResponseEntity.ok(Map.of("success", true, "bookingId", saved.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error","Invalid request: " + e.getMessage()));
        }
    }
}
