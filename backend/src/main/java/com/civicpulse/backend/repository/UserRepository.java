package com.civicpulse.backend.repository;

import com.civicpulse.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // Magic Method: Spring automatically understands this!
    // It creates SQL like: "SELECT * FROM users WHERE email = ?"
    Optional<User> findByEmail(String email);

    // Fetch users based on Role and Enabled status(PHASE-2)
    List<User> findByRoleAndEnabled(String role, boolean enabled);

    //For module-2 - 19/12
    List<User> findByRole(String role);
}


