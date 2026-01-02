//Added for module-2 - 19/12
// Location: src/main/java/com/civicpulse/backend/controller/UserController.java
package com.civicpulse.backend.controller;

import com.civicpulse.backend.model.User;
import com.civicpulse.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // This fetches all users who have the role 'OFFICER'
    @GetMapping("/officers")
    public List<User> getOfficers() {
        return userRepository.findByRole("OFFICER");
    }

    // --- ADD THIS ENDPOINT ---
    @GetMapping("/citizens")
    public List<User> getCitizens() {
        // Fetches all users who have the role "CITIZEN"
        return userRepository.findByRole("CITIZEN");
    }
}