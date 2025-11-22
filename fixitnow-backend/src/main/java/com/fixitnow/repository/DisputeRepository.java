package com.fixitnow.repository;

import com.fixitnow.model.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Dispute> findByProviderIdOrderByCreatedAtDesc(Long providerId);
    List<Dispute> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
    List<Dispute> findByStatusOrderByCreatedAtDesc(String status);
    List<Dispute> findAllByOrderByCreatedAtDesc();
}
