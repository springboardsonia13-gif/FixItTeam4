package com.fixitnow.controller;

import com.fixitnow.config.AuthUser;
import com.fixitnow.model.Message;
import com.fixitnow.repository.MessageRepository;
import com.fixitnow.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final MessageRepository messageRepo;
    private final UserRepository userRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(MessageRepository messageRepo, 
                         UserRepository userRepo,
                         SimpMessagingTemplate messagingTemplate) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * WebSocket endpoint to send a message
     * Clients send to: /app/chat.send
     * Payload: { senderId, receiverId, content }
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, Object> payload) {
        try {
            Long senderId = Long.valueOf(payload.get("senderId").toString());
            Long receiverId = Long.valueOf(payload.get("receiverId").toString());
            String content = payload.get("content").toString();

            // Save to database
            Message message = new Message();
            message.setSenderId(senderId);
            message.setReceiverId(receiverId);
            message.setContent(content);
            Message saved = messageRepo.save(message);

            // Send to receiver via WebSocket
            messagingTemplate.convertAndSend("/queue/messages." + receiverId, saved);
            
            // Also send back to sender for confirmation
            messagingTemplate.convertAndSend("/queue/messages." + senderId, saved);

        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
        }
    }

    /**
     * Get conversation history between current user and another user
     * GET /api/chat/conversation/{userId}
     */
    @GetMapping("/conversation/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getConversation(@PathVariable Long userId, @AuthUser Long currentUserId) {
        List<Message> messages = messageRepo.findConversation(currentUserId, userId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Get list of users the current user has chatted with
     * GET /api/chat/conversations
     */
    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getConversations(@AuthUser Long currentUserId) {
        List<Long> partnerIds = messageRepo.findConversationPartners(currentUserId);
        
        // Fetch user details for each partner
        List<Map<String, Object>> conversations = partnerIds.stream()
            .map(partnerId -> {
                Map<String, Object> conv = new HashMap<>();
                userRepo.findById(partnerId).ifPresent(user -> {
                    conv.put("userId", user.getId());
                    conv.put("name", user.getName());
                    conv.put("email", user.getEmail());
                    conv.put("role", user.getRole());
                });
                
                // Get last message
                List<Message> msgs = messageRepo.findConversation(currentUserId, partnerId);
                if (!msgs.isEmpty()) {
                    Message lastMsg = msgs.get(msgs.size() - 1);
                    conv.put("lastMessage", lastMsg.getContent());
                    conv.put("lastMessageTime", lastMsg.getSentAt());
                }
                return conv;
            })
            .filter(conv -> !conv.isEmpty())
            .collect(Collectors.toList());

        return ResponseEntity.ok(conversations);
    }

    /**
     * Send a message via REST API (alternative to WebSocket)
     * POST /api/chat/send
     * Body: { receiverId, content }
     */
    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendMessageRest(@RequestBody Map<String, Object> body, @AuthUser Long senderId) {
        try {
            Long receiverId = Long.valueOf(body.get("receiverId").toString());
            String content = body.get("content").toString();

            Message message = new Message();
            message.setSenderId(senderId);
            message.setReceiverId(receiverId);
            message.setContent(content);
            Message saved = messageRepo.save(message);

            // Also send via WebSocket if connected
            messagingTemplate.convertAndSend("/queue/messages." + receiverId, saved);

            return ResponseEntity.status(201).body(Map.of(
                "message", "Message sent",
                "id", saved.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to send message: " + e.getMessage()));
        }
    }
}