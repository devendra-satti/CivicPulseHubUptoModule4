//Under Development
package com.civicpulse.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/officer")
@PreAuthorize("hasAuthority('OFFICER')") // Only OFFICERS allowed
public class OfficerController {

    @GetMapping("/assigned-complaints")
    public String getComplaints() {
        return "List of complaints assigned to this officer";
    }
}