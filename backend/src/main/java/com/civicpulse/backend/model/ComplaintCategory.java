//Added for module-2 - 18/12
package com.civicpulse.backend.model;

import jakarta.persistence.*;
import lombok.Data; // Import Lombok

@Data // Generates Getters, Setters, ToString, etc.
@Entity
@Table(name = "complaint_categories")
public class ComplaintCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private String name;
}