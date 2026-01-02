//Added for module-2 - 18/12//Added for module-2 - 18/12 - 28/12
// Location: src/main/java/com/civicpulse/backend/model/Complaint.java
package com.civicpulse.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Table(name = "complaints")
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "category_id")
    private Integer categoryId;

    @Column(name = "assigned_to")
    private Long assignedTo; 

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    // Original Complaint Location
    private String location;
    private Double latitude;
    private Double longitude;
    
    // Status can now include: "PENDING", "ASSIGNED", "RESOLVED", "REJECTED", "REOPENED"
    private String status = "PENDING"; 
    private String priority = "MEDIUM"; 
    
    // Visible to Officer and Citizen
    @Column(columnDefinition = "TEXT")
    private String admin_comment;
    
    // --- NEW FIELD: Materials Used ---
    @Column(columnDefinition = "TEXT")
    private String materialsUsed; // Stores text like "2 bags cement, 5 bricks"

    // --- NEW FIELDS: Resolution Validation ---
    @Column(name = "resolution_proof_url")
    private String resolution_proof_url; 

    // To verify officer was at the location during upload
    private Double resolvedLatitude;
    private Double resolvedLongitude;

    private String citizen_feedback;
    private Integer citizen_rating;

    @Column(name = "created_at", insertable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    // --- NEW FIELD: SLA Tracking ---
    // This tracks WHEN the officer was assigned, to calculate the 24hr deadline
    @Temporal(TemporalType.TIMESTAMP)
    private Date assignedAt; 

    @UpdateTimestamp
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
}