// Location: src/main/java/com/civicpulse/backend/controller/ComplaintController.java
// Description: Handles API requests for complaints, history, notifications, and geo-fencing.

package com.civicpulse.backend.controller;

import com.civicpulse.backend.model.Complaint;
import com.civicpulse.backend.model.ComplaintCategory;
import com.civicpulse.backend.model.ComplaintHistory; 
import com.civicpulse.backend.model.User;
import com.civicpulse.backend.model.Notification; // IMPORTED
import com.civicpulse.backend.repository.ComplaintCategoryRepository;
import com.civicpulse.backend.repository.ComplaintHistoryRepository;
import com.civicpulse.backend.repository.ComplaintRepository;
import com.civicpulse.backend.repository.NotificationRepository; // IMPORTED
import com.civicpulse.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired private ComplaintRepository complaintRepository;
    @Autowired private ComplaintCategoryRepository categoryRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ComplaintHistoryRepository historyRepository; 
    @Autowired private NotificationRepository notificationRepository; // INJECTED

    private final String UPLOAD_DIR = "uploads/";

    // --- HELPER: Save to History ---
    private void logHistory(Complaint complaint, User user, String action, String details) {
        ComplaintHistory history = new ComplaintHistory();
        history.setComplaint(complaint);
        history.setActionBy(user); // Can be null for system/bulk actions
        history.setActionType(action);
        history.setDetails(details);
        historyRepository.save(history);
    }

    // --- HELPER: Create Notification ---
    private void createNotification(User recipient, String message, String type, Integer complaintId) {
        if (recipient == null) return;
        Notification n = new Notification();
        n.setUser(recipient);
        n.setMessage(message);
        n.setType(type); // "SUCCESS", "ALERT", "INFO"
        n.setRelatedComplaintId(complaintId);
        notificationRepository.save(n);
    }

    // --- HELPER: Geo-Calculation ---
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; 
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000;
    }

    @GetMapping("/categories")
    public List<ComplaintCategory> getCategories() { return categoryRepository.findAll(); }

    @GetMapping("/my-complaints/{userId}")
    public List<Complaint> getUserComplaints(@PathVariable Long userId) { return complaintRepository.findByUserId(userId); }
    
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OFFICER')") 
    @GetMapping("/all")
    public List<Complaint> getAllComplaints() { return complaintRepository.findAll(); }

    // --- FETCH HISTORY ---
    @GetMapping("/{id}/history")
    public List<ComplaintHistory> getHistory(@PathVariable Integer id) {
        return historyRepository.findByComplaintIdOrderByTimestampDesc(id);
    }

    // --- NEW HELPER: Notify all Admins ---
    private void notifyAdmins(String message, String type, Integer complaintId) {
        List<User> admins = userRepository.findByRole("ADMIN");
        for (User admin : admins) {
            createNotification(admin, message, type, complaintId);
        }
    }

    // --- CREATE ---
    @PostMapping("/add")
    public ResponseEntity<?> createComplaint(
            @RequestParam("title") String title, @RequestParam("description") String description,
            @RequestParam("categoryId") Integer categoryId, @RequestParam("userId") Long userId,
            @RequestParam("location") String location, @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude, @RequestParam(value = "image", required = false) MultipartFile file
    ) {
        try {
            Complaint complaint = new Complaint();
            complaint.setTitle(title); complaint.setDescription(description); complaint.setCategoryId(categoryId);
            User userObj = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            complaint.setUser(userObj);
            complaint.setLocation(location); complaint.setLatitude(latitude); complaint.setLongitude(longitude);

            if (file != null && !file.isEmpty()) {
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR + fileName);
                Files.createDirectories(path.getParent());
                Files.write(path, file.getBytes());
                complaint.setImageUrl(fileName);
            }
            complaintRepository.save(complaint);
            
            notifyAdmins("New Complaint Filed: " + title, "INFO", complaint.getId());

            logHistory(complaint, userObj, "CREATED", "Complaint filed.");
            return ResponseEntity.ok("Complaint submitted successfully!");
        } catch (IOException e) { return ResponseEntity.internalServerError().body("Error: " + e.getMessage()); }
    }

    // --- ADMIN: ASSIGN (Unlocks Ticket & Resets Logic) ---
    @PutMapping("/assign-bulk")
    public ResponseEntity<?> assignBulk(@RequestBody BulkAssignRequest request) {
        List<Complaint> complaints = complaintRepository.findAllById(request.getComplaintIds());
        User officer = userRepository.findById(request.getOfficerId()).orElse(null);
        
        for (Complaint c : complaints) {
            c.setAssignedTo(request.getOfficerId());
            c.setStatus("IN_PROGRESS"); // Unlocks ticket if it was REOPENED
            c.setAssignedAt(new Date());
            

            logHistory(c, null, "ASSIGNED", "Assigned to Officer: " + (officer != null ? officer.getName() : request.getOfficerId()));
            
            // NOTIFY OFFICER
            if (officer != null) {
                createNotification(officer, "New Task Assigned: " + c.getTitle(), "INFO", c.getId());
            }
            
        }
        complaintRepository.saveAll(complaints);
        return ResponseEntity.ok("Assigned successfully");
    }

    // --- ADMIN: REJECT ---
    @PutMapping("/reject/{id}")
    public ResponseEntity<?> rejectComplaint(@PathVariable Integer id, @RequestParam String comment) {
        return complaintRepository.findById(id).map(c -> {
            c.setStatus("REJECTED");
            c.setAdmin_comment(comment);
            c.setAssignedTo(null);
            complaintRepository.save(c);
            
            logHistory(c, null, "REJECTED", "Reason: " + comment);
            
            // NOTIFY CITIZEN
            createNotification(c.getUser(), "Complaint Rejected: " + c.getTitle(), "ALERT", c.getId());
            
            return ResponseEntity.ok("Complaint Rejected");
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ADMIN: COMMENT ONLY ---
    @PutMapping("/comment/{id}")
    public ResponseEntity<?> updateAdminComment(@PathVariable Integer id, @RequestParam String comment) {
        return complaintRepository.findById(id).map(c -> {
            c.setAdmin_comment(comment);
            complaintRepository.save(c);
            
            logHistory(c, null, "NOTE_ADDED", "Admin Note: " + comment);
            return ResponseEntity.ok("Comment updated");
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- REOPEN (Locks Ticket & Updates Metrics) ---
    @PutMapping("/reopen/{id}")
    public ResponseEntity<?> reopenComplaint(@PathVariable Integer id) {
        return complaintRepository.findById(id).map(c -> {
            
            // 1. UPDATE METRICS (Penalize current officer)
            if (c.getAssignedTo() != null) {
                User officer = userRepository.findById(c.getAssignedTo()).orElse(null);
                if (officer != null) {
                    officer.setTicketsReopened((officer.getTicketsReopened() == null ? 0 : officer.getTicketsReopened()) + 1);
                    userRepository.save(officer);
                    
                    // NOTIFY OFFICER
                    createNotification(officer, "Task Reopened: " + c.getTitle() + ". Waiting for Admin.", "ALERT", c.getId());
                }
            }

            // 2. LOCK TICKET
            c.setStatus("REOPENED"); 
            c.setPriority("HIGH");
            // Do NOT unassign (officer still sees it)
            
            complaintRepository.save(c);
            
            // 3. LOG HISTORY
            logHistory(c, null, "REOPENED", "Ticket reopened. Waiting for Admin approval.");

            // --- ADD THIS ---
            notifyAdmins("⚠️ Ticket #" + id + " Reopened. Needs Re-assignment.", "ALERT", id);
            
            return ResponseEntity.ok("Complaint Reopened");
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ADMIN: UPDATE PRIORITY ---
    @PutMapping("/priority/{id}")
    public ResponseEntity<?> updatePriority(@PathVariable Integer id, @RequestParam String priority) {
        return complaintRepository.findById(id).map(c -> {
            c.setPriority(priority);
            complaintRepository.save(c);
            
            // Optional: Log this action to history
            logHistory(c, null, "PRIORITY_CHANGE", "Priority changed to " + priority);
            
            return ResponseEntity.ok("Priority updated");
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // --- OFFICER: RESOLVE (Locks, Geo-Fence & Metrics) ---
    @PutMapping("/resolve/{id}")
    public ResponseEntity<?> resolveComplaint(
            @PathVariable Integer id,
            @RequestParam(value = "proof", required = false) MultipartFile file,
            @RequestParam("materials") String materials,
            @RequestParam("lat") Double currentLat,
            @RequestParam("lng") Double currentLng
    ) {
        return complaintRepository.findById(id).map(c -> {
            // 1. LOCK CHECK
            if ("REOPENED".equals(c.getStatus())) throw new RuntimeException("Action Blocked: Admin must re-assign this ticket.");

            // 2. GEO CHECK
            if (c.getLatitude() != null && c.getLongitude() != null) {
                double distance = calculateDistance(c.getLatitude(), c.getLongitude(), currentLat, currentLng);
                if (distance > 200) throw new RuntimeException("Location Mismatch (" + (int)distance + "m away).");
            }

            // 3. UPDATE METRICS (Reward Officer)
            if(c.getAssignedTo() != null) {
                User officer = userRepository.findById(c.getAssignedTo()).orElse(null);
                if(officer != null) {
                    officer.setTicketsResolved((officer.getTicketsResolved() == null ? 0 : officer.getTicketsResolved()) + 1);
                    userRepository.save(officer);
                    
                    logHistory(c, officer, "RESOLVED", "Materials: " + materials);
                }
            }

            // 4. UPDATE COMPLAINT
            c.setStatus("RESOLVED");
            c.setMaterialsUsed(materials);
            c.setResolvedLatitude(currentLat);
            c.setResolvedLongitude(currentLng);
            
            if (file != null && !file.isEmpty()) {
                try {
                    String fileName = "RESOLVED_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path path = Paths.get("uploads/" + fileName);
                    Files.createDirectories(path.getParent());
                    Files.write(path, file.getBytes());
                    c.setResolution_proof_url(fileName);
                } catch (IOException e) { throw new RuntimeException("Error saving proof"); }
            }
            complaintRepository.save(c);
            
            // NOTIFY CITIZEN
            createNotification(c.getUser(), "Complaint Resolved: " + c.getTitle() + ". Please rate us.", "SUCCESS", c.getId());

            return ResponseEntity.ok("Resolved Successfully");
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // --- CITIZEN: FEEDBACK ---
    @PutMapping("/feedback/{id}")
    public ResponseEntity<?> submitFeedback(@PathVariable Integer id, @RequestParam Integer rating, @RequestParam String feedback) {
        return complaintRepository.findById(id).map(c -> {
            c.setCitizen_rating(rating);
            c.setCitizen_feedback(feedback);
            complaintRepository.save(c);
            
            logHistory(c, c.getUser(), "RATED", "Rating: " + rating + " Stars. Feedback: " + feedback);
            return ResponseEntity.ok("Feedback recorded");
        }).orElse(ResponseEntity.notFound().build());
    }

    public static class BulkAssignRequest {
        private List<Integer> complaintIds;
        private Long officerId;
        public List<Integer> getComplaintIds() { return complaintIds; }
        public void setComplaintIds(List<Integer> complaintIds) { this.complaintIds = complaintIds; }
        public Long getOfficerId() { return officerId; }
        public void setOfficerId(Long officerId) { this.officerId = officerId; }
    }
}