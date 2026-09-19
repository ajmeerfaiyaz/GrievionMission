package com.civicconnect.dto;

import jakarta.validation.constraints.NotNull;

public class SupportRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    public SupportRequest() {
    }

    public SupportRequest(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
