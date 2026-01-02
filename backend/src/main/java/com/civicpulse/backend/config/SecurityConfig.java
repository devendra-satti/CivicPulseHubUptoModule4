package com.civicpulse.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired; //p2
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;//p2

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    //Phase-2
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter; // 1. Inject the Filter

    //To verify whether the request have permission/not
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for simple API use
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Connect to Frontend(Third Block downside)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Allow Login and Signup
                .requestMatchers("/uploads/**").permitAll()  // <--- NEW: Allow access to images!
                .requestMatchers("/api/admin/**").hasAuthority("ADMIN") // Only ADMIN role can access
                .requestMatchers("/api/users/**").hasAnyAuthority("ADMIN", "OFFICER")
                .anyRequest().authenticated() // Lock everything else(eg.DashBoard)
            )

            // 2. Add the Filter BEFORE the username/password check(Phase-2)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // This handles password encryption (hashing)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // This tells the backend to accept requests from your React Frontend(request is from valid frontend/not)
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        //Defining the CORS rules
        CorsConfiguration config = new CorsConfiguration();
        // config.setAllowedOrigins(List.of("http://localhost:5173")); // URL of your React App

        // ALLOW YOUR COMPUTER'S IP and the Mobile connection
        config.setAllowedOrigins(List.of(
            "http://localhost:3000",      // Desktop browser
            "http://localhost:5173",      // Vite Desktop
            "http://192.168.1.2:3000",    // Mobile browser (React App port)
            "http://192.168.1.2:5173"     // Mobile browser (Vite port)
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); //Applying CORS rules to all endpoints
        return source;
    }

    
}