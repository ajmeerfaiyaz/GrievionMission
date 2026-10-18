package com.civicconnect.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Test Controller for verifying backend initialization (Phase 3 Step 3.1)
 */
@RestController
@RequestMapping("/api")
public class TestController {

    /**
     * Test verification endpoint
     * 
     * GET /api/test
     * Returns: "Grievion Mission Backend is running successfully!"
     */
    @GetMapping("/test")
    public String testEndpoint() {
        return "Grievion Mission Backend is running successfully!";
    }
}
