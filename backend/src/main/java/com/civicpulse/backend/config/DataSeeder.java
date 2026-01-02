package com.civicpulse.backend.config;

import com.civicpulse.backend.model.User;
import com.civicpulse.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    //When the app starts, run this code to seed data.CommandLineRunner is an interface
    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if admin exists, if not, create one
            if (userRepository.findByEmail("admin@civicpulse.com").isEmpty()) {
                User admin = new User();
                admin.setName("Super Admin");
                admin.setEmail("admin@civicpulse.com");
                admin.setPassword(passwordEncoder.encode("admin123")); // Default Password
                admin.setRole("ADMIN");
                admin.setEnabled(true); // Admin is always enabled
                userRepository.save(admin);
                System.out.println("✅ Default Admin Created: admin@civicpulse.com / admin123");
            }
        };
    }
}