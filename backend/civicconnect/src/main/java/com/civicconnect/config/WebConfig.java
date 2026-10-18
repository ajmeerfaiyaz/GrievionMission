package com.civicconnect.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Web MVC Configuration
 * Configures static resource serving for uploaded media and global CORS policy.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        java.nio.file.Path cwd = Paths.get("").toAbsolutePath().normalize();
        java.util.List<String> locations = new java.util.ArrayList<>();

        // 1. Primary backend uploads directory
        java.nio.file.Path backendUploads = cwd.resolve("backend").resolve("civicconnect").resolve("uploads");
        if (java.nio.file.Files.isDirectory(backendUploads)) {
            locations.add(formatResourceLocation(backendUploads));
        }

        // 2. Working directory uploads
        locations.add(formatResourceLocation(cwd.resolve("uploads")));

        // 3. Parent directory uploads (when started from backend/civicconnect)
        locations.add(formatResourceLocation(cwd.resolve("..").resolve("uploads")));

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(locations.toArray(new String[0]))
                .setCachePeriod(3600);
    }

    private String formatResourceLocation(java.nio.file.Path path) {
        String uri = path.toAbsolutePath().normalize().toUri().toString();
        return uri.endsWith("/") ? uri : uri + "/";
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*");
    }
}
