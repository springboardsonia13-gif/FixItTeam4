package com.fixitnow.repository;

import com.fixitnow.model.DisputeGroupChatMessageRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DisputeGroupChatMessageReadRepository extends JpaRepository<DisputeGroupChatMessageRead, Long> {
    Optional<DisputeGroupChatMessageRead> findByMessageIdAndUserId(Long messageId, Long userId);
    
    List<DisputeGroupChatMessageRead> findByMessageId(Long messageId);
    
    long countByMessageIdAndIsReadFalse(Long messageId);
}
