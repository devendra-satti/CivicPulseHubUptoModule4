package com.civicpulse.backend.controller;

import com.civicpulse.backend.model.Notification;
import com.civicpulse.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // Get my notifications
    @GetMapping("/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Get unread count (for the badge)
    @GetMapping("/unread-count/{userId}")
    public long getUnreadCount(@PathVariable Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // Mark as read
    @PutMapping("/read/{id}")
    public ResponseEntity<?> markAsRead(@PathVariable Integer id) {
        return notificationRepository.findById(id).map(n -> {
            n.setRead(true);
            notificationRepository.save(n);
            return ResponseEntity.ok("Read");
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // Mark ALL as read
    @PutMapping("/read-all/{userId}")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for(Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
        return ResponseEntity.ok("All Read");
    }
}