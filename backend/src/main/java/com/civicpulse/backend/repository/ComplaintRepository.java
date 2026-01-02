//Added for module-2 - 18/12

// src/main/java/com/civicpulse/backend/repository/ComplaintRepository.java
// This handles all database operations for Complaints.
package com.civicpulse.backend.repository;

import com.civicpulse.backend.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {
    
    // Find all complaints submitted by a specific user (for Citizen Dashboard)
    List<Complaint> findByUserId(Long userId);

    // Find all complaints assigned to a specific officer (for Officer Dashboard)
    // We use a custom query because assignedTo can be null
    List<Complaint> findByAssignedTo(Long officerId);
}