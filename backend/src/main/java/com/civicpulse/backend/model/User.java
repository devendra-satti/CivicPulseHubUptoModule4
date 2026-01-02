package com.civicpulse.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id //Indicates Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) //For Automatic generation of ids
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String role;
    private String department; // For Officers
    private String wardNumber; // For Citizens

    // If true: User can login. If false: User is pending approval.
    @Column(columnDefinition = "boolean default true")
    private boolean enabled = true;

    // --- ADD THESE NEW FIELDS FOR ACCURACY TRACKING ---
    @Column(name = "tickets_resolved")
    private Integer ticketsResolved = 0;

    @Column(name = "tickets_reopened")
    private Integer ticketsReopened = 0;
}