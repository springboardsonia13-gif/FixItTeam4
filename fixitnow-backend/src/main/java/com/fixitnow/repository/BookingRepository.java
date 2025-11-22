package com.fixitnow.repository;

import com.fixitnow.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByProviderIdOrderByCreatedAtDesc(Long providerId);
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
