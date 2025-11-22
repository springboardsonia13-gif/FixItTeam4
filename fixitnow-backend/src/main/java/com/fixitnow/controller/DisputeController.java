package com.fixitnow.controller;

import com.fixitnow.model.Dispute;
import com.fixitnow.model.Booking;
import com.fixitnow.model.User;
import com.fixitnow.model.DisputeGroupChatMessage;
import com.fixitnow.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/disputes")
public class DisputeController {

    private final DisputeRepository disputeRepo;
    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;
    private final DisputeGroupChatMessageRepository groupChatRepo;
    private final DisputeGroupChatMessageReadRepository messageReadRepo;

    public DisputeController(DisputeRepository disputeRepo, BookingRepository bookingRepo, UserRepository userRepo,
                             DisputeGroupChatMessageRepository groupChatRepo, DisputeGroupChatMessageReadRepository messageReadRepo) {
        this.disputeRepo = disputeRepo;
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
        this.groupChatRepo = groupChatRepo;
        this.messageReadRepo = messageReadRepo;
    }

    /**
     * Customer creates a dispute/report
     * POST /api/disputes
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createDispute(@RequestBody Map<String, Object> payload, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            Optional<User> userOpt = userRepo.findByEmail(principal.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            Long customerId = userOpt.get().getId();
            
            Long bookingId = Long.valueOf(payload.get("bookingId").toString());
            
            // Verify booking exists and belongs to customer
            Optional<Booking> bookingOpt = bookingRepo.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
            }
            
            Booking booking = bookingOpt.get();
            if (!booking.getCustomerId().equals(customerId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Not your booking"));
            }

            Dispute dispute = new Dispute();
            dispute.setBookingId(bookingId);
            dispute.setCustomerId(customerId);
            dispute.setProviderId(booking.getProviderId());
            dispute.setServiceId(booking.getServiceId());
            dispute.setCategory(payload.getOrDefault("category", "OTHER").toString());
            dispute.setSubject(payload.get("subject").toString());
            dispute.setDescription(payload.get("description").toString());
            
            if (payload.containsKey("refundAmount")) {
                dispute.setRefundAmount(Double.valueOf(payload.get("refundAmount").toString()));
            }

            disputeRepo.save(dispute);

            return ResponseEntity.ok(Map.of(
                "message", "Dispute created successfully",
                "disputeId", dispute.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid request: " + e.getMessage()));
        }
    }

    /**
     * Get customer's disputes
     * GET /api/disputes/my
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyDisputes(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        
        Optional<User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        Long customerId = userOpt.get().getId();
        
        List<Dispute> disputes = disputeRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return ResponseEntity.ok(disputes);
    }

    /**
     * Get disputes for a specific booking
     * GET /api/disputes/booking/{bookingId}
     */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDisputesByBooking(@PathVariable Long bookingId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        
        Optional<User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        Long userId = userOpt.get().getId();
        // Verify user has access to this booking
        Optional<Booking> bookingOpt = bookingRepo.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }
        
        Booking booking = bookingOpt.get();
        if (!booking.getCustomerId().equals(userId) && !booking.getProviderId().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        List<Dispute> disputes = disputeRepo.findByBookingIdOrderByCreatedAtDesc(bookingId);
        return ResponseEntity.ok(disputes);
    }

    /**
     * Admin: Get all disputes
     * GET /api/disputes/admin/all
     */
    @GetMapping("/admin/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllDisputes(@RequestParam(required = false) String status) {
        List<Dispute> disputes;
        if (status != null && !status.isEmpty()) {
            disputes = disputeRepo.findByStatusOrderByCreatedAtDesc(status);
        } else {
            disputes = disputeRepo.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(disputes);
    }

    /**
     * Admin: Update dispute status and resolution
     * PATCH /api/disputes/admin/{id}
     */
    @PatchMapping("/admin/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateDispute(@PathVariable Long id, @RequestBody Map<String, Object> payload, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        
        Optional<User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        Long adminId = userOpt.get().getId();
        Optional<Dispute> disputeOpt = disputeRepo.findById(id);
        if (disputeOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Dispute not found"));
        }

        Dispute dispute = disputeOpt.get();

        if (payload.containsKey("status")) {
            dispute.setStatus(payload.get("status").toString());
            if ("RESOLVED".equals(dispute.getStatus()) || "REJECTED".equals(dispute.getStatus())) {
                dispute.setResolvedAt(LocalDateTime.now());
            }
        }

        if (payload.containsKey("adminNotes")) {
            dispute.setAdminNotes(payload.get("adminNotes").toString());
        }

        if (payload.containsKey("resolutionNotes")) {
            dispute.setResolutionNotes(payload.get("resolutionNotes").toString());
        }

        if (payload.containsKey("refundStatus")) {
            dispute.setRefundStatus(payload.get("refundStatus").toString());
        }

        if (payload.containsKey("refundAmount")) {
            dispute.setRefundAmount(Double.valueOf(payload.get("refundAmount").toString()));
        }

        if (payload.containsKey("assignedAdminId")) {
            dispute.setAssignedAdminId(Long.valueOf(payload.get("assignedAdminId").toString()));
        } else if (dispute.getAssignedAdminId() == null) {
            dispute.setAssignedAdminId(adminId);
        }

        disputeRepo.save(dispute);

        return ResponseEntity.ok(Map.of(
            "message", "Dispute updated successfully",
            "dispute", dispute
        ));
    }

    /**
     * Get group chat messages for a dispute
     * GET /api/disputes/{id}/group-chat
     */
    @GetMapping("/{id}/group-chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getGroupChatMessages(@PathVariable Long id, Principal principal) {
        Optional<Dispute> disputeOpt = disputeRepo.findById(id);
        if (disputeOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Dispute not found"));
        }

        Dispute dispute = disputeOpt.get();
        Optional<User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        Long userId = user.getId();

        // Verify user is involved in this dispute or is admin
        if (!dispute.getCustomerId().equals(userId) && !dispute.getProviderId().equals(userId) && !user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        List<DisputeGroupChatMessage> messages = groupChatRepo.findByDisputeIdOrderByCreatedAtAsc(id);
        return ResponseEntity.ok(Map.of("messages", messages));
    }

    /**
     * Send a message in group chat for a dispute
     * POST /api/disputes/{id}/group-chat
     */
    @PostMapping("/{id}/group-chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendGroupChatMessage(@PathVariable Long id, @RequestBody Map<String, Object> payload, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            Optional<Dispute> disputeOpt = disputeRepo.findById(id);
            if (disputeOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Dispute not found"));
            }

            Optional<User> userOpt = userRepo.findByEmail(principal.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            Dispute dispute = disputeOpt.get();
            User user = userOpt.get();
            Long userId = user.getId();

            // Determine sender type and verify access
            String senderType = "ADMIN";
            if (dispute.getCustomerId().equals(userId)) {
                senderType = "CUSTOMER";
            } else if (dispute.getProviderId().equals(userId)) {
                senderType = "PROVIDER";
            } else if (!user.getRole().name().equals("ADMIN")) {
                // Non-admin users can only send messages if they're involved in the dispute
                return ResponseEntity.status(403).body(Map.of("error", "You are not involved in this dispute"));
            }

            DisputeGroupChatMessage message = new DisputeGroupChatMessage();
            message.setDisputeId(id);
            message.setSenderId(userId);
            message.setSenderType(senderType);
            message.setMessage(payload.get("message").toString());

            groupChatRepo.save(message);

            return ResponseEntity.ok(Map.of(
                "message", "Message sent successfully",
                "messageId", message.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid request: " + e.getMessage()));
        }
    }

    /**
     * Get service chats for a user (customer/provider)
     * GET /api/disputes/service-chats/my
     */
    @GetMapping("/service-chats/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyServiceChats(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Optional<User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        Long userId = userOpt.get().getId();

        // Get disputes where user is customer or provider
        List<Dispute> disputes = disputeRepo.findAll().stream()
            .filter(d -> d.getCustomerId().equals(userId) || d.getProviderId().equals(userId))
            .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
            .toList();

        return ResponseEntity.ok(disputes);
    }

    /**
     * Mark messages as read for a dispute (per-user)
     * PUT /api/disputes/{id}/group-chat/mark-read
     */
    @PutMapping("/{id}/group-chat/mark-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markMessagesAsRead(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Optional<Dispute> disputeOpt = disputeRepo.findById(id);
        if (disputeOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Dispute not found"));
        }

        Dispute dispute = disputeOpt.get();
        Optional<User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        Long userId = userOpt.get().getId();

        // Verify user is involved in this dispute
        if (!dispute.getCustomerId().equals(userId) && !dispute.getProviderId().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        // Get all messages in this dispute
        List<DisputeGroupChatMessage> allMessages = groupChatRepo.findByDisputeIdOrderByCreatedAtAsc(id);
        
        // Mark messages as read for this specific user
        for (DisputeGroupChatMessage msg : allMessages) {
            // Don't mark own messages as read
            if (!msg.getSenderId().equals(userId)) {
                var readRecord = messageReadRepo.findByMessageIdAndUserId(msg.getId(), userId);
                if (readRecord.isEmpty()) {
                    var newRead = new com.fixitnow.model.DisputeGroupChatMessageRead();
                    newRead.setMessageId(msg.getId());
                    newRead.setUserId(userId);
                    newRead.setIsRead(true);
                    messageReadRepo.save(newRead);
                } else {
                    var record = readRecord.get();
                    record.setIsRead(true);
                    messageReadRepo.save(record);
                }
            }
        }

        return ResponseEntity.ok(Map.of("message", "Messages marked as read"));
    }

    /**
     * Get unread message count for a dispute (per-user, excluding messages sent by current user)
     * GET /api/disputes/{id}/group-chat/unread-count
     */
    @GetMapping("/{id}/group-chat/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Optional<Dispute> disputeOpt = disputeRepo.findById(id);
        if (disputeOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Dispute not found"));
        }

        Dispute dispute = disputeOpt.get();
        Optional<User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        Long userId = userOpt.get().getId();

        // Verify user is involved in this dispute
        if (!dispute.getCustomerId().equals(userId) && !dispute.getProviderId().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        // Get all messages in this dispute that were NOT sent by current user
        List<DisputeGroupChatMessage> messages = groupChatRepo.findByDisputeIdOrderByCreatedAtAsc(id).stream()
            .filter(msg -> !msg.getSenderId().equals(userId))
            .toList();

        // Count how many of these messages are unread for this specific user
        long unreadCount = 0;
        for (DisputeGroupChatMessage msg : messages) {
            var readRecord = messageReadRepo.findByMessageIdAndUserId(msg.getId(), userId);
            if (readRecord.isEmpty() || !readRecord.get().getIsRead()) {
                unreadCount++;
            }
        }

        return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
    }

    /**
     * Get total unread message count for all service chats of a user (per-user, excluding messages sent by user)
     * GET /api/disputes/service-chats/unread-total
     */
    @GetMapping("/service-chats/unread-total")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getTotalUnreadCount(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Optional<User> userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        Long userId = userOpt.get().getId();

        // Get all disputes where user is customer or provider
        List<Dispute> disputes = disputeRepo.findAll().stream()
            .filter(d -> d.getCustomerId().equals(userId) || d.getProviderId().equals(userId))
            .toList();

        // Count total unread messages across all disputes (per-user, excluding messages sent by current user)
        long totalUnread = 0;
        for (Dispute dispute : disputes) {
            List<DisputeGroupChatMessage> messages = groupChatRepo.findByDisputeIdOrderByCreatedAtAsc(dispute.getId()).stream()
                .filter(msg -> !msg.getSenderId().equals(userId))
                .toList();
            
            for (DisputeGroupChatMessage msg : messages) {
                var readRecord = messageReadRepo.findByMessageIdAndUserId(msg.getId(), userId);
                if (readRecord.isEmpty() || !readRecord.get().getIsRead()) {
                    totalUnread++;
                }
            }
        }

        return ResponseEntity.ok(Map.of("totalUnread", totalUnread));
    }
}
