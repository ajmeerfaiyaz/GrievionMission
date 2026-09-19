package com.civicconnect.controller;

import com.civicconnect.dto.ApiResponse;
import com.civicconnect.entity.Complaint;
import com.civicconnect.repository.ComplaintRepository;
import com.civicconnect.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for Municipal Admin Operations & Analytics
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public AdminController(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    /**
     * Helper to verify ADMIN role
     */
    private boolean isNotAdmin(String role) {
        return role == null || !"ADMIN".equalsIgnoreCase(role.trim());
    }

    /**
     * Admin Dashboard Statistics
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats(
            @RequestHeader(value = "X-User-Role", required = false) String headerRole,
            @RequestParam(value = "role", required = false) String paramRole) {

        String role = headerRole != null ? headerRole : paramRole;
        if (isNotAdmin(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Admin authorization required."));
        }

        List<Complaint> complaints = complaintRepository.findAll();
        long total = complaints.size();
        long pending = complaints.stream().filter(c -> "PENDING".equalsIgnoreCase(c.getStatus())).count();
        long inProgress = complaints.stream().filter(c -> "IN_PROGRESS".equalsIgnoreCase(c.getStatus())).count();
        long resolved = complaints.stream().filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus())).count();
        long rejected = complaints.stream().filter(c -> "REJECTED".equalsIgnoreCase(c.getStatus())).count();
        long highPriority = complaints.stream().filter(c -> "HIGH".equalsIgnoreCase(c.getPriority())).count();
        long totalUsers = userRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalComplaints", total);
        stats.put("pendingComplaints", pending);
        stats.put("inProgressComplaints", inProgress);
        stats.put("resolvedComplaints", resolved);
        stats.put("rejectedComplaints", rejected);
        stats.put("highPriorityComplaints", highPriority);
        stats.put("totalUsers", totalUsers);

        return ResponseEntity.ok(ApiResponse.success("Admin stats retrieved", stats));
    }

    /**
     * Admin Analytics & Breakdown Data for Charts
     * GET /api/admin/analytics
     */
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics(
            @RequestHeader(value = "X-User-Role", required = false) String headerRole,
            @RequestParam(value = "role", required = false) String paramRole) {

        String role = headerRole != null ? headerRole : paramRole;
        if (isNotAdmin(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Admin authorization required."));
        }

        List<Complaint> complaints = complaintRepository.findAll();

        Map<String, Long> categoryBreakdown = complaints.stream()
                .collect(Collectors.groupingBy(c -> c.getCategory() != null ? c.getCategory() : "Other", Collectors.counting()));

        Map<String, Long> priorityBreakdown = complaints.stream()
                .collect(Collectors.groupingBy(c -> c.getPriority() != null ? c.getPriority() : "Medium", Collectors.counting()));

        Map<String, Long> statusBreakdown = complaints.stream()
                .collect(Collectors.groupingBy(c -> c.getStatus() != null ? c.getStatus() : "PENDING", Collectors.counting()));

        Map<String, Long> departmentBreakdown = complaints.stream()
                .collect(Collectors.groupingBy(c -> c.getDepartment() != null ? c.getDepartment() : "Unassigned", Collectors.counting()));

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("categoryBreakdown", categoryBreakdown);
        analytics.put("priorityBreakdown", priorityBreakdown);
        analytics.put("statusBreakdown", statusBreakdown);
        analytics.put("departmentBreakdown", departmentBreakdown);

        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved", analytics));
    }

    /**
     * Change Complaint Status (PENDING -> IN_PROGRESS -> RESOLVED / REJECTED)
     * PUT /api/admin/complaints/{id}/status
     */
    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ApiResponse<Complaint>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-User-Role", required = false) String headerRole) {

        String role = payload.get("role") != null ? payload.get("role") : headerRole;
        if (isNotAdmin(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Admin authorization required."));
        }

        Optional<Complaint> complaintOpt = complaintRepository.findById(id);
        if (complaintOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Complaint not found with ID: " + id));
        }

        String newStatus = payload.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Status field is required (PENDING, IN_PROGRESS, RESOLVED, REJECTED)."));
        }

        Complaint complaint = complaintOpt.get();
        complaint.setStatus(newStatus.trim().toUpperCase());

        if (payload.get("adminNotes") != null) {
            complaint.setAdminNotes(payload.get("adminNotes").trim());
        }

        Complaint updated = complaintRepository.save(complaint);
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + complaint.getStatus() + "!", updated));
    }

    /**
     * Assign Complaint to Department
     * PUT /api/admin/complaints/{id}/assign
     */
    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<ApiResponse<Complaint>> assignDepartment(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-User-Role", required = false) String headerRole) {

        String role = payload.get("role") != null ? payload.get("role") : headerRole;
        if (isNotAdmin(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Admin authorization required."));
        }

        Optional<Complaint> complaintOpt = complaintRepository.findById(id);
        if (complaintOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Complaint not found with ID: " + id));
        }

        String department = payload.get("department");
        if (department == null || department.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Department field is required."));
        }

        Complaint complaint = complaintOpt.get();
        complaint.setDepartment(department.trim());

        Complaint updated = complaintRepository.save(complaint);
        return ResponseEntity.ok(ApiResponse.success("Department assigned to " + department + "!", updated));
    }
}
