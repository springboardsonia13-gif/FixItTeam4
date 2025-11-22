package com.fixitnow.dto;

import java.util.List;

/**
 * DTO used by frontend when saving provider profile.
 * Example JSON:
 * { "categories": ["Electrician","Plumber"], "description": "I do X", "location": "Bhubaneswar" }
 */
public class ProviderProfileRequest {
    private List<String> categories;
    private String description;
    private String location;
    private String verificationDocumentUrl;

    public ProviderProfileRequest() {}

    public List<String> getCategories() { return categories; }
    public void setCategories(List<String> categories) { this.categories = categories; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getVerificationDocumentUrl() { return verificationDocumentUrl; }
    public void setVerificationDocumentUrl(String verificationDocumentUrl) { this.verificationDocumentUrl = verificationDocumentUrl; }

    // Convert to a JSON string for DB storage (uses Jackson under the hood)
    public String getCategoriesJson() {
        if (categories == null) return "[]";
        try {
            return com.fasterxml.jackson.databind.json.JsonMapper.builder().build().writeValueAsString(categories);
        } catch (Exception e) {
            return "[]";
        }
    }
}
