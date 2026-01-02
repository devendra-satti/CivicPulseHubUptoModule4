//Added for module-2 - 18/12

// src/main/java/com/civicpulse/backend/repository/ComplaintCategoryRepository.java
// This helps us fetch the list of categories (Water, Electricity, etc.) for the dropdown menu.
package com.civicpulse.backend.repository;

import com.civicpulse.backend.model.ComplaintCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintCategoryRepository extends JpaRepository<ComplaintCategory, Integer> {
    // No extra methods needed yet
}