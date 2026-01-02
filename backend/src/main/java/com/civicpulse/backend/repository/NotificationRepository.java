package com.civicpulse.backend.repository;

import com.civicpulse.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    // Fetch unread or all notifications for a specific user, newest first
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Optional: Count unread
    long countByUserIdAndIsReadFalse(Long userId);
}