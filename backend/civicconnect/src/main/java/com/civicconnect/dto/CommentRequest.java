package com.civicconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CommentRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    private String userName;

    @NotBlank(message = "Comment text must not be empty")
    private String text;

    public CommentRequest() {
    }

    public CommentRequest(Long userId, String userName, String text) {
        this.userId = userId;
        this.userName = userName;
        this.text = text;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
