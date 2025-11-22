package com.fixitnow.repository;

import com.fixitnow.model.DisputeGroupChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeGroupChatMessageRepository extends JpaRepository<DisputeGroupChatMessage, Long> {
    List<DisputeGroupChatMessage> findByDisputeIdOrderByCreatedAtAsc(Long disputeId);
    
    List<DisputeGroupChatMessage> findByDisputeIdAndIsReadFalseOrderByCreatedAtAsc(Long disputeId);
    
    long countByDisputeIdAndIsReadFalse(Long disputeId);
    
    long countByDisputeIdAndIsReadFalseAndSenderIdNot(Long disputeId, Long senderId);
}
