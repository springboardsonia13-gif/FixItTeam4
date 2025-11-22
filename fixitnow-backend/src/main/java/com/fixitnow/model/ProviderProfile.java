package com.fixitnow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "provider_profiles")
public class ProviderProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", unique = true, nullable = false)
    private Long providerId;

    @Column(columnDefinition = "JSON")
    private String categories; // JSON string: e.g. '["Electrician","Plumber"]'

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;

    @Column(name = "verification_status")
    private String verificationStatus; // PENDING, APPROVED, REJECTED

    @Column(name = "verification_document_url")
    private String verificationDocumentUrl; // URL or path to uploaded document

    @Column(name = "verification_notes")
    private String verificationNotes; // Admin notes for rejection/approval

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.verificationStatus == null) {
            this.verificationStatus = "PENDING";
        }
    }

    // --- getters & setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getCategories() { return categories; }
    public void setCategories(String categories) { this.categories = categories; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getVerificationDocumentUrl() { return verificationDocumentUrl; }
    public void setVerificationDocumentUrl(String verificationDocumentUrl) { this.verificationDocumentUrl = verificationDocumentUrl; }

    public String getVerificationNotes() { return verificationNotes; }
    public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
