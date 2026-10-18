package com.civicconnect.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * File Storage Service for Evidence Proof Uploads (Images & Videos)
 */
@Service
public class FileStorageService {

    private final Path uploadDir;

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = new HashSet<>(
            Arrays.asList("jpg", "jpeg", "png", "webp")
    );

    private static final Set<String> ALLOWED_VIDEO_EXTENSIONS = new HashSet<>(
            Arrays.asList("mp4", "webm", "mov")
    );

    private static final long MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

    public FileStorageService() {
        Path cwd = Paths.get("").toAbsolutePath().normalize();
        Path candidate;
        if (Files.isDirectory(cwd.resolve("backend").resolve("civicconnect"))) {
            // Running from project root
            candidate = cwd.resolve("backend").resolve("civicconnect").resolve("uploads");
        } else if (cwd.endsWith("civicconnect")) {
            // Running from backend/civicconnect
            candidate = cwd.resolve("uploads");
        } else {
            candidate = cwd.resolve("uploads");
        }
        this.uploadDir = candidate.normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory: " + this.uploadDir, e);
        }
    }

    /**
     * Stores an uploaded file and returns its public URL path.
     */
    public StoredFileResult storeFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("Invalid file name.");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        boolean isImage = ALLOWED_IMAGE_EXTENSIONS.contains(extension);
        boolean isVideo = ALLOWED_VIDEO_EXTENSIONS.contains(extension);

        if (!isImage && !isVideo) {
            throw new IllegalArgumentException("Unsupported file type ." + extension + ". Allowed: JPG, PNG, WEBP, MP4, WEBM, MOV.");
        }

        if (isImage && file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("Image size exceeds maximum limit of 15MB.");
        }

        if (isVideo && file.getSize() > MAX_VIDEO_SIZE) {
            throw new IllegalArgumentException("Video size exceeds maximum limit of 50MB.");
        }

        // Generate unique filename to prevent collisions
        String storedFilename = UUID.randomUUID() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path targetLocation = this.uploadDir.resolve(storedFilename);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        String fileUrl = "/uploads/" + storedFilename;
        String mediaType = isImage ? "IMAGE" : "VIDEO";

        return new StoredFileResult(fileUrl, originalFilename, mediaType, file.getSize());
    }

    public static class StoredFileResult {
        private final String fileUrl;
        private final String originalName;
        private final String mediaType;
        private final long fileSize;

        public StoredFileResult(String fileUrl, String originalName, String mediaType, long fileSize) {
            this.fileUrl = fileUrl;
            this.originalName = originalName;
            this.mediaType = mediaType;
            this.fileSize = fileSize;
        }

        public String getFileUrl() { return fileUrl; }
        public String getOriginalName() { return originalName; }
        public String getMediaType() { return mediaType; }
        public long getFileSize() { return fileSize; }
    }
}
