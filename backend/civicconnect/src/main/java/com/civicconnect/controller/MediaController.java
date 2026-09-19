package com.civicconnect.controller;

import com.civicconnect.dto.ApiResponse;
import com.civicconnect.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * REST Controller for uploading photo and video evidence proof.
 */
@RestController
@RequestMapping("/api/media")
@CrossOrigin(origins = "*")
public class MediaController {

    private final FileStorageService fileStorageService;

    public MediaController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * Upload Evidence Media (Photo: JPG, PNG, WEBP; Video: MP4, WEBM, MOV)
     * POST /api/media/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileStorageService.StoredFileResult>> uploadFile(
            @RequestParam("file") MultipartFile file) {

        try {
            FileStorageService.StoredFileResult result = fileStorageService.storeFile(file);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Media uploaded successfully!", result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to store media file: " + e.getMessage()));
        }
    }
}
