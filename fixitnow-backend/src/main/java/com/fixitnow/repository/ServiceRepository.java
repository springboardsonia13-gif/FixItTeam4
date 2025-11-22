package com.fixitnow.repository;

import com.fixitnow.model.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByProviderId(Long providerId);
    List<ServiceEntity> findByLatitudeIsNullOrLongitudeIsNull();
}
