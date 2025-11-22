// package com.fixitnow.repository;

// import com.fixitnow.model.ProviderProfile;
// import org.springframework.data.jpa.repository.JpaRepository;
// import java.util.Optional;

// public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {
//     Optional<ProviderProfile> findByProviderId(Long providerId);
// }
package com.fixitnow.repository;

import com.fixitnow.model.ProviderProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {
    Optional<ProviderProfile> findByProviderId(Long providerId);
    List<ProviderProfile> findByVerificationStatus(String status);
    List<ProviderProfile> findAllByOrderByCreatedAtDesc();
}
