package com.civicconnect.controller;

import com.civicconnect.dto.ApiResponse;
import com.civicconnect.dto.CommentRequest;
import com.civicconnect.entity.Comment;
import com.civicconnect.repository.CommentRepository;
import com.civicconnect.repository.ComplaintRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST Controller for Citizen Comments on Complaints
 */
@RestController
@RequestMapping("/api/complaints/{complaintId}/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentRepository commentRepository;
    private final ComplaintRepository complaintRepository;

    public CommentController(CommentRepository commentRepository, ComplaintRepository complaintRepository) {
        this.commentRepository = commentRepository;
        this.complaintRepository = complaintRepository;
    }

    /**
     * Add a comment to a complaint
     * POST /api/complaints/{complaintId}/comments
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Comment>> addComment(
            @PathVariable Long complaintId,
            @Valid @RequestBody CommentRequest request) {

        if (!complaintRepository.existsById(complaintId)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Complaint not found with ID: " + complaintId));
        }

        if (request.getText() == null || request.getText().trim().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Comment text cannot be empty."));
        }

        Comment comment = new Comment(
                complaintId,
                request.getUserId(),
                request.getUserName() != null ? request.getUserName().trim() : "Citizen",
                request.getText().trim()
        );

        Comment saved = commentRepository.save(comment);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added successfully!", saved));
    }

    /**
     * Get all comments for a complaint
     * GET /api/complaints/{complaintId}/comments
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Comment>>> getComments(@PathVariable Long complaintId) {
        if (!complaintRepository.existsById(complaintId)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Complaint not found with ID: " + complaintId));
        }

        List<Comment> comments = commentRepository.findByComplaintIdOrderByCreatedAtAsc(complaintId);
        return ResponseEntity.ok(ApiResponse.success("Comments retrieved successfully", comments));
    }
}
