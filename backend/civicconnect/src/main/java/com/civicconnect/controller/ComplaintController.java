package com.civicconnect.controller;

import com.civicconnect.dto.AIAnalyzeRequest;
import com.civicconnect.dto.ApiResponse;
import com.civicconnect.dto.ComplaintRequest;
import com.civicconnect.dto.ComplaintUpdateRequest;
import com.civicconnect.dto.SupportRequest;
import com.civicconnect.entity.Complaint;
import com.civicconnect.entity.Support;
import com.civicconnect.repository.CommentRepository;
import com.civicconnect.repository.ComplaintRepository;
import com.civicconnect.repository.SupportRepository;
import com.civicconnect.service.AIService;
import com.civicconnect.service.DepartmentRoutingService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for Grievance Management, AI Auto-Classification,
 * Department Routing, Support Votes, and Ownership Enforcement.
 */
@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintRepository complaintRepository;
    private final SupportRepository supportRepository;
    private final CommentRepository commentRepository;
    private final AIService aiService;
    private final DepartmentRoutingService departmentRoutingService;

    public ComplaintController(ComplaintRepository complaintRepository,
                               SupportRepository supportRepository,
                               CommentRepository commentRepository,
                               AIService aiService,
                               DepartmentRoutingService departmentRoutingService) {
        this.complaintRepository = complaintRepository;
        this.supportRepository = supportRepository;
        this.commentRepository = commentRepository;
        this.aiService = aiService;
        this.departmentRoutingService = departmentRoutingService;
    }

    /**
     * AI Analysis Preview Endpoint
     * POST /api/complaints/ai-analyze
     * 
     * Analyzes complaint text in real-time, predicting category, priority,
     * summary, and duplicate warning.
     */
    @PostMapping("/ai-analyze")
    public ResponseEntity<ApiResponse<AIService.AIAnalysisResult>> analyzeComplaint(
            @Valid @RequestBody AIAnalyzeRequest request) {

        List<Complaint> existing = complaintRepository.findAll();
        AIService.AIAnalysisResult result = aiService.analyzeComplaint(
                request.getTitle(), request.getDescription(), existing
        );

        return ResponseEntity.ok(ApiResponse.success("AI analysis completed", result));
    }

    /**
     * Submit a new civic grievance
     * POST /api/complaints
     * 
     * Automatically applies AI category/priority prediction (if not specified),
     * generates AI summary, performs duplicate check, and routes to responsible department.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Complaint>> createComplaint(@Valid @RequestBody ComplaintRequest request) {
        String title = request.getTitle().trim();
        String description = request.getDescription().trim();

        // 1. AI Categorization & Priority
        String category = (request.getCategory() != null && !request.getCategory().isBlank())
                ? request.getCategory().trim()
                : aiService.predictCategory(title, description);

        String priority = (request.getPriority() != null && !request.getPriority().isBlank())
                ? request.getPriority().trim()
                : aiService.predictPriority(title, description, category);

        // 2. AI Duplicate Detection
        List<Complaint> existing = complaintRepository.findAll();
        AIService.DuplicateCheckResult dupResult = aiService.detectDuplicates(title, description, category, existing);

        // 3. AI Summarization & Smart Department Routing
        String aiSummary = aiService.generateSummary(description);
        String department = departmentRoutingService.suggestDepartment(category, title, description);

        Complaint complaint = new Complaint(
                title,
                description,
                category,
                request.getLocation().trim(),
                priority,
                request.getCreatedBy(),
                request.getCreatedByName() != null ? request.getCreatedByName().trim() : "Citizen"
        );

        complaint.setStatus("PENDING");
        complaint.setSupportCount(0);
        complaint.setDepartment(department);
        complaint.setAiSummary(aiSummary);
        complaint.setImageUrl(request.getImageUrl());
        complaint.setVideoUrl(request.getVideoUrl());

        if (dupResult.isDuplicate()) {
            complaint.setIsDuplicateOf(dupResult.getMatchedComplaintId());
        }

        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint registered and routed to " + department + "!", saved));
    }

    /**
     * List all complaints with optional filtering by status, category, priority, or createdBy
     * GET /api/complaints
     * GET /api/complaints?createdBy=1
     * GET /api/complaints?status=PENDING
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Complaint>>> getAllComplaints(
            @RequestParam(required = false) Long createdBy,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String query) {

        List<Complaint> list = complaintRepository.findAll();

        if (createdBy != null) {
            list = list.stream().filter(c -> c.getCreatedBy().equals(createdBy)).collect(Collectors.toList());
        }
        if (category != null && !category.equalsIgnoreCase("All")) {
            list = list.stream().filter(c -> c.getCategory().equalsIgnoreCase(category)).collect(Collectors.toList());
        }
        if (status != null && !status.equalsIgnoreCase("All")) {
            list = list.stream().filter(c -> c.getStatus().equalsIgnoreCase(status)).collect(Collectors.toList());
        }
        if (priority != null && !priority.equalsIgnoreCase("All")) {
            list = list.stream().filter(c -> c.getPriority().equalsIgnoreCase(priority)).collect(Collectors.toList());
        }
        if (query != null && !query.isBlank()) {
            String q = query.trim().toLowerCase();
            list = list.stream().filter(c ->
                    (c.getTitle() != null && c.getTitle().toLowerCase().contains(q)) ||
                    (c.getDescription() != null && c.getDescription().toLowerCase().contains(q)) ||
                    (c.getLocation() != null && c.getLocation().toLowerCase().contains(q)) ||
                    (c.getCategory() != null && c.getCategory().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }

        return ResponseEntity.ok(ApiResponse.success("Complaints retrieved successfully", list));
    }

    /**
     * Get complaint details by ID
     * GET /api/complaints/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Complaint>> getComplaintById(@PathVariable Long id) {
        Optional<Complaint> complaintOpt = complaintRepository.findById(id);

        if (complaintOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Complaint not found with ID: " + id));
        }

        return ResponseEntity.ok(ApiResponse.success("Complaint found", complaintOpt.get()));
    }

    /**
     * Update an existing complaint with Backend Ownership Enforcement
     * PUT /api/complaints/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Complaint>> updateComplaint(
            @PathVariable Long id,
            @RequestBody ComplaintUpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        Optional<Complaint> complaintOpt = complaintRepository.findById(id);
        if (complaintOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Complaint not found with ID: " + id));
        }

        Complaint existing = complaintOpt.get();

        // Determine caller identity (from body or header)
        Long callerId = request.getCallerId() != null ? request.getCallerId() : headerUserId;
        String callerRole = request.getCallerRole() != null ? request.getCallerRole() : headerUserRole;

        // BACKEND OWNERSHIP ENFORCEMENT:
        // Only creator OR an ADMIN can update a complaint
        if (callerId != null && !existing.getCreatedBy().equals(callerId) && !"ADMIN".equalsIgnoreCase(callerRole)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: You can only edit your own complaints."));
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            existing.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            existing.setDescription(request.getDescription().trim());
            existing.setAiSummary(aiService.generateSummary(request.getDescription().trim()));
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            existing.setCategory(request.getCategory().trim());
            if (request.getDepartment() == null || request.getDepartment().isBlank()) {
                existing.setDepartment(departmentRoutingService.suggestDepartment(request.getCategory().trim(), existing.getTitle(), existing.getDescription()));
            }
        }
        if (request.getLocation() != null && !request.getLocation().isBlank()) {
            existing.setLocation(request.getLocation().trim());
        }
        if (request.getPriority() != null && !request.getPriority().isBlank()) {
            existing.setPriority(request.getPriority().trim());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            existing.setStatus(request.getStatus().trim().toUpperCase());
        }
        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            existing.setDepartment(request.getDepartment().trim());
        }
        if (request.getImageUrl() != null) {
            existing.setImageUrl(request.getImageUrl());
        }
        if (request.getVideoUrl() != null) {
            existing.setVideoUrl(request.getVideoUrl());
        }
        if (request.getAdminNotes() != null) {
            existing.setAdminNotes(request.getAdminNotes());
        }

        Complaint updated = complaintRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success("Complaint updated successfully!", updated));
    }

    /**
     * Delete a complaint with Backend Ownership Enforcement
     * DELETE /api/complaints/{id}
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteComplaint(
            @PathVariable Long id,
            @RequestParam(required = false) Long callerId,
            @RequestParam(required = false) String callerRole,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        Optional<Complaint> complaintOpt = complaintRepository.findById(id);
        if (complaintOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Complaint not found with ID: " + id));
        }

        Complaint existing = complaintOpt.get();
        Long effectiveCallerId = callerId != null ? callerId : headerUserId;
        String effectiveRole = callerRole != null ? callerRole : headerUserRole;

        // BACKEND OWNERSHIP ENFORCEMENT:
        if (effectiveCallerId != null && !existing.getCreatedBy().equals(effectiveCallerId) && !"ADMIN".equalsIgnoreCase(effectiveRole)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: You can only delete your own complaints."));
        }

        // Clean up associated comments
        commentRepository.deleteByComplaintId(id);

        complaintRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Complaint deleted successfully!"));
    }

    /**
     * Support a complaint ("I Have This Problem")
     * POST /api/complaints/{id}/support
     * 
     * Enforces single support vote per citizen.
     */
    @PostMapping("/{id}/support")
    @Transactional
    public ResponseEntity<ApiResponse<Complaint>> supportComplaint(
            @PathVariable Long id,
            @Valid @RequestBody SupportRequest request) {

        Optional<Complaint> complaintOpt = complaintRepository.findById(id);
        if (complaintOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Complaint not found with ID: " + id));
        }

        Long userId = request.getUserId();

        if (supportRepository.existsByComplaintIdAndUserId(id, userId)) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("You have already supported this complaint."));
        }

        Support support = new Support(id, userId);
        supportRepository.save(support);

        Complaint complaint = complaintOpt.get();
        complaint.setSupportCount((complaint.getSupportCount() != null ? complaint.getSupportCount() : 0) + 1);
        Complaint updated = complaintRepository.save(complaint);

        return ResponseEntity.ok(ApiResponse.success("Support recorded successfully!", updated));
    }
}
