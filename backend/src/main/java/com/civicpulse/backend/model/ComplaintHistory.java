package com.civicpulse.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;
import org.hibernate.annotations.CreationTimestamp;

@Data
@Entity
@Table(name = "complaint_history")
public class ComplaintHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    // Who performed the action? (Admin, Officer, or Citizen)
    @ManyToOne
    @JoinColumn(name = "action_by_user_id")
    private User actionBy;

    private String actionType; // E.g., "ASSIGNED", "RESOLVED", "REOPENED", "COMMENTED"
    
    @Column(columnDefinition = "TEXT")
    private String details; // E.g., "Assigned to Officer John", "Materials: 5 bags cement"

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;
}