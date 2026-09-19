package com.civicconnect.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Smart Complaint Routing Service
 * 
 * Automatically routes civic grievances to the responsible municipal department/team.
 */
@Service
public class DepartmentRoutingService {

    private static final Map<String, String> CATEGORY_TO_DEPARTMENT = new HashMap<>();
    static {
        CATEGORY_TO_DEPARTMENT.put("Water", "Water Supply & Drainage Department");
        CATEGORY_TO_DEPARTMENT.put("Roads", "Roads & Infrastructure Department");
        CATEGORY_TO_DEPARTMENT.put("Electricity", "Electrical & Power Department");
        CATEGORY_TO_DEPARTMENT.put("Waste", "Waste Management & Sanitation");
        CATEGORY_TO_DEPARTMENT.put("Sanitation", "Health & Sanitation Department");
        CATEGORY_TO_DEPARTMENT.put("Traffic", "Traffic & Transport Department");
        CATEGORY_TO_DEPARTMENT.put("Other", "General Municipal Administration");
    }

    /**
     * Determines responsible department based on category and description keywords.
     */
    public String suggestDepartment(String category, String title, String description) {
        if (category != null && CATEGORY_TO_DEPARTMENT.containsKey(category)) {
            return CATEGORY_TO_DEPARTMENT.get(category);
        }

        String combined = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase();
        if (combined.contains("pipe") || combined.contains("water") || combined.contains("drain")) {
            return "Water Supply & Drainage Department";
        } else if (combined.contains("pothole") || combined.contains("road") || combined.contains("footpath")) {
            return "Roads & Infrastructure Department";
        } else if (combined.contains("light") || combined.contains("electric") || combined.contains("lamp")) {
            return "Electrical & Power Department";
        } else if (combined.contains("garbage") || combined.contains("waste") || combined.contains("dustbin")) {
            return "Waste Management & Sanitation";
        } else if (combined.contains("traffic") || combined.contains("signal")) {
            return "Traffic & Transport Department";
        }

        return "General Municipal Administration";
    }
}
