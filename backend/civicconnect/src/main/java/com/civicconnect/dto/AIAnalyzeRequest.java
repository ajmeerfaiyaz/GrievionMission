package com.civicconnect.dto;

import jakarta.validation.constraints.NotBlank;

public class AIAnalyzeRequest {

    private String title;

    @NotBlank(message = "Description text is required for AI analysis")
    private String description;

    public AIAnalyzeRequest() {
    }

    public AIAnalyzeRequest(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
