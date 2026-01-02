
//Under Development
package com.civicpulse.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CitizenController{
    
    // If someone tries to hit this endpoint via Postman without the CITIZEN role,
    // Spring throws a 403 Forbidden error automatically.
    @GetMapping("/citizen-dashboard")
    @PreAuthorize("hasAuthority('CITIZEN')") 
    public ResponseEntity<String> getDashboardData() {
        return ResponseEntity.ok("Welcome to the Citizen Dashboard.");
    }
}
