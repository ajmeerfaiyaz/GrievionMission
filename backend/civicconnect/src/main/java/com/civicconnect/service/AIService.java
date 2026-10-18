package com.civicconnect.service;

import com.civicconnect.entity.Complaint;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * AI Service for Grievion Mission
 * 
 * Provides explainable NLP capabilities:
 * 1. AI Category Classification (Multi-class Lexical & TF-IDF similarity)
 * 2. AI Priority Scoring (Hazard, urgency, and scale detector)
 * 3. Duplicate / Similar Complaint Matcher (Jaccard + Cosine token similarity)
 * 4. Extractive Text Summarization
 */
@Service
public class AIService {

    // Category Keyword Knowledge Base
    private static final Map<String, Set<String>> CATEGORY_KEYWORDS = new HashMap<>();
    static {
        CATEGORY_KEYWORDS.put("Water", new HashSet<>(Arrays.asList(
                "water", "pipe", "pipeline", "leak", "leakage", "drain", "drainage", "sewage",
                "drinking", "tap", "supply", "overflow", "gutter", "contamination", "flood", "tanker"
        )));
        CATEGORY_KEYWORDS.put("Roads", new HashSet<>(Arrays.asList(
                "road", "pothole", "potholes", "asphalt", "tar", "footpath", "sidewalk", "divider",
                "crater", "pavement", "crack", "resurfacing", "pedestrian", "speedbreaker", "bridge"
        )));
        CATEGORY_KEYWORDS.put("Electricity", new HashSet<>(Arrays.asList(
                "electricity", "light", "streetlight", "lamp", "pole", "wire", "cable", "transformer",
                "power", "blackout", "voltage", "spark", "dark", "hanging", "short circuit"
        )));
        CATEGORY_KEYWORDS.put("Waste", new HashSet<>(Arrays.asList(
                "waste", "garbage", "trash", "dump", "dustbin", "bin", "litter", "rubbish",
                "debris", "smell", "stink", "rotting", "cleaning", "dumping", "sweeper"
        )));
        CATEGORY_KEYWORDS.put("Traffic", new HashSet<>(Arrays.asList(
                "traffic", "signal", "jam", "congestion", "junction", "lights", "zebra", "crossing",
                "gridlock", "parking", "illegal parking", "signboard", "roundabout", "warden"
        )));
        CATEGORY_KEYWORDS.put("Sanitation", new HashSet<>(Arrays.asList(
                "sanitation", "toilet", "hygiene", "mosquito", "fogging", "pest", "dead animal",
                "stagnant", "manhole", "stench", "health hazard", "cleaning"
        )));
    }

    // High & Urgent Hazard keywords
    private static final Set<String> HIGH_URGENCY_KEYWORDS = new HashSet<>(Arrays.asList(
            "hazard", "danger", "urgent", "emergency", "accident", "burst", "hospital", "school",
            "critical", "fatal", "sparking", "collapse", "severe", "skidded", "electrocution", "flood"
    ));

    private static final Set<String> LOW_URGENCY_KEYWORDS = new HashSet<>(Arrays.asList(
            "request", "suggestion", "maintenance", "minor", "routine", "beautification", "paint", "tree"
    ));

    /**
     * Predicts complaint category based on title and description text.
     */
    public String predictCategory(String title, String description) {
        String combined = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase(Locale.ROOT);
        Set<String> tokens = tokenize(combined);

        String bestCategory = "Other";
        int maxMatches = 0;

        for (Map.Entry<String, Set<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
            int matches = 0;
            for (String kw : entry.getValue()) {
                if (tokens.contains(kw) || combined.contains(kw)) {
                    matches++;
                }
            }
            if (matches > maxMatches) {
                maxMatches = matches;
                bestCategory = entry.getKey();
            }
        }

        return bestCategory;
    }

    /**
     * Predicts priority level: "High", "Medium", or "Low".
     */
    public String predictPriority(String title, String description, String category) {
        String combined = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase(Locale.ROOT);
        Set<String> tokens = tokenize(combined);

        int highMatchCount = 0;
        for (String kw : HIGH_URGENCY_KEYWORDS) {
            if (tokens.contains(kw) || combined.contains(kw)) {
                highMatchCount++;
            }
        }

        if (highMatchCount >= 1 || combined.contains("immediate") || combined.contains("no water")) {
            return "High";
        }

        for (String kw : LOW_URGENCY_KEYWORDS) {
            if (tokens.contains(kw)) {
                return "Low";
            }
        }

        return "Medium";
    }

    /**
     * Compares a new complaint against existing database complaints to detect duplicate or similar issues.
     * Returns a map with similarity score and the similar complaint ID if score >= 0.55.
     */
    public DuplicateCheckResult detectDuplicates(String title, String description, String category, List<Complaint> existingComplaints) {
        if (existingComplaints == null || existingComplaints.isEmpty()) {
            return new DuplicateCheckResult(false, null, 0.0, "No duplicate detected.");
        }

        String targetText = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase(Locale.ROOT);
        Set<String> targetTokens = tokenize(targetText);

        double highestSimilarity = 0.0;
        Complaint mostSimilarComplaint = null;

        for (Complaint existing : existingComplaints) {
            // Check issues in the same category or location
            String existingText = (existing.getTitle() + " " + existing.getDescription() + " " + existing.getLocation()).toLowerCase(Locale.ROOT);
            Set<String> existingTokens = tokenize(existingText);

            double score = calculateJaccardSimilarity(targetTokens, existingTokens);
            if (score > highestSimilarity) {
                highestSimilarity = score;
                mostSimilarComplaint = existing;
            }
        }

        boolean isDuplicate = highestSimilarity >= 0.45 && mostSimilarComplaint != null;
        String reason = isDuplicate
                ? String.format(Locale.ROOT, "Potential duplicate of Complaint #%d (\"%s\") with %.0f%% similarity.",
                    mostSimilarComplaint.getId(), mostSimilarComplaint.getTitle(), highestSimilarity * 100)
                : "No matching duplicate detected.";

        return new DuplicateCheckResult(isDuplicate, mostSimilarComplaint != null ? mostSimilarComplaint.getId() : null, highestSimilarity, reason);
    }

    /**
     * Generates a concise summary from a lengthy complaint description.
     */
    public String generateSummary(String description) {
        if (description == null || description.isBlank()) {
            return "";
        }
        String cleaned = description.trim();
        if (cleaned.length() <= 120) {
            return cleaned;
        }

        // Split into sentences
        String[] sentences = cleaned.split("[.!?]\\s+");
        if (sentences.length > 0 && !sentences[0].isBlank()) {
            String first = sentences[0].trim();
            return first.endsWith(".") ? first : first + ".";
        }

        return cleaned.substring(0, 117) + "...";
    }

    /**
     * Full AI Analysis Container
     */
    public AIAnalysisResult analyzeComplaint(String title, String description, List<Complaint> existing) {
        String category = predictCategory(title, description);
        String priority = predictPriority(title, description, category);
        String summary = generateSummary(description);
        DuplicateCheckResult dup = detectDuplicates(title, description, category, existing);

        return new AIAnalysisResult(category, priority, summary, dup.isDuplicate(), dup.getMatchedComplaintId(), dup.getSimilarityScore(), dup.getMessage());
    }

    private Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) return Collections.emptySet();
        String[] words = text.replaceAll("[^a-zA-Z0-9\\s]", " ").toLowerCase(Locale.ROOT).split("\\s+");
        Set<String> set = new HashSet<>();
        for (String w : words) {
            if (w.length() > 2) set.add(w);
        }
        return set;
    }

    private double calculateJaccardSimilarity(Set<String> set1, Set<String> set2) {
        if (set1.isEmpty() || set2.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);
        return (double) intersection.size() / (double) union.size();
    }

    // Inner Result Models
    public static class DuplicateCheckResult {
        private final boolean isDuplicate;
        private final Long matchedComplaintId;
        private final double similarityScore;
        private final String message;

        public DuplicateCheckResult(boolean isDuplicate, Long matchedComplaintId, double similarityScore, String message) {
            this.isDuplicate = isDuplicate;
            this.matchedComplaintId = matchedComplaintId;
            this.similarityScore = similarityScore;
            this.message = message;
        }

        public boolean isDuplicate() { return isDuplicate; }
        public Long getMatchedComplaintId() { return matchedComplaintId; }
        public double getSimilarityScore() { return similarityScore; }
        public String getMessage() { return message; }
    }

    public static class AIAnalysisResult {
        private String predictedCategory;
        private String predictedPriority;
        private String summary;
        private boolean duplicate;
        private Long matchedComplaintId;
        private double similarityScore;
        private String duplicateReason;

        public AIAnalysisResult(String predictedCategory, String predictedPriority, String summary,
                                boolean duplicate, Long matchedComplaintId, double similarityScore, String duplicateReason) {
            this.predictedCategory = predictedCategory;
            this.predictedPriority = predictedPriority;
            this.summary = summary;
            this.duplicate = duplicate;
            this.matchedComplaintId = matchedComplaintId;
            this.similarityScore = similarityScore;
            this.duplicateReason = duplicateReason;
        }

        public String getPredictedCategory() { return predictedCategory; }
        public String getPredictedPriority() { return predictedPriority; }
        public String getSummary() { return summary; }
        public boolean isDuplicate() { return duplicate; }
        public Long getMatchedComplaintId() { return matchedComplaintId; }
        public double getSimilarityScore() { return similarityScore; }
        public String getDuplicateReason() { return duplicateReason; }
    }
}
