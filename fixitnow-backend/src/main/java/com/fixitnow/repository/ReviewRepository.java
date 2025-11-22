package com.fixitnow.repository;

import com.fixitnow.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProviderIdOrderByCreatedAtDesc(Long providerId);
    List<Review> findByServiceIdOrderByCreatedAtDesc(Long serviceId); // ✅ ADD THIS
    List<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId); // ✅ ADD THIS
    List<Review> findByBookingId(Long bookingId);
    
}