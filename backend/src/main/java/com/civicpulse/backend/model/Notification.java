package com.civicpulse.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

@Data
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Who is this notification for?
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore  // <-- Add this line
    private User user;

    private String message;
    
    // Type helps frontend decide color (e.g., SUCCESS=Green, ALERT=Red)
    private String type; // "SUCCESS", "ALERT", "INFO"
    
    private Integer relatedComplaintId; // Optional: To link directly to a task

    // --- FIX IS HERE ---
    @JsonProperty("isRead") // Forces JSON key to stay "isRead"
    private boolean isRead = false;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
}