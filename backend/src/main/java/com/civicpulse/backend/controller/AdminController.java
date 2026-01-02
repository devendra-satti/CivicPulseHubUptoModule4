//PHASE-2
package com.civicpulse.backend.controller;

import com.civicpulse.backend.model.User;
import com.civicpulse.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.civicpulse.backend.services.MailService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MailService mailService;  // inject here - added new


    // 1. Get All Pending Officers
    @GetMapping("/pending-officers")
    public ResponseEntity<List<User>> getPendingOfficers() {
        // Find all users who are "OFFICER" and enabled=false
        return ResponseEntity.ok(userRepository.findByRoleAndEnabled("OFFICER", false));
    }

    // 2. Approve an Officer
    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveOfficer(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            //As we are sending mails,While sending mail there is latency to reach the last return statement,
            //In That scenario user(admin) is able to click approve multiple times(leads to multiple mails to officer)
            //To Prevent we are checking first is officer enabled(As we are enabling officer before sending mail). 
            if (user.isEnabled()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Officer is already approved!"));
            }

            user.setEnabled(true); // Enable login
            userRepository.save(user);

            //Sending Email to Officer After Admin Approval -  //Added newly 10/12/25
            // For dev testing
            String loginUrl = "http://localhost:5173/login?email=" + user.getEmail();

            // // For production (replace with your actual domain)
            // String loginUrl = "https://civicpulse.com/login?email=" + user.getEmail();
            String htmlBody = "<p>Dear Officer,</p>"
                + "<p>Your account has been successfully approved.</p>"
                + "<p><a href='" + loginUrl + "' "
                + "style='display:inline-block;padding:10px 20px;"
                + "background-color:#4CAF50;color:white;text-decoration:none;"
                + "border-radius:5px;'>Login Now</a></p>";
            mailService.sendHtmlEmail(user.getEmail(), "ACCOUNT APPROVED", htmlBody);
 
            return ResponseEntity.ok(Map.of("message", "Officer approved successfully!"));
        }).orElse(ResponseEntity.notFound().build());
    }
}