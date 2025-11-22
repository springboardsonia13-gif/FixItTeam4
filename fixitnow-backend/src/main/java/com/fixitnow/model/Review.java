// package com.fixitnow.model;

// import jakarta.persistence.*;
// import java.time.LocalDateTime;

// @Entity
// @Table(name = "reviews")
// public class Review {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @Column(name = "booking_id", nullable = false)
//     private Long bookingId;

//     @Column(name = "customer_id", nullable = false)
//     private Long customerId;

//     @Column(name = "provider_id", nullable = false)
//     private Long providerId;

//     private Integer rating;

//     @Column(columnDefinition = "TEXT")
//     private String comment;

//     @Column(name = "created_at")
//     private LocalDateTime createdAt;

//     @PrePersist
//     public void prePersist() {
//         this.createdAt = LocalDateTime.now();
//     }

//     // getters/setters
//     public Long getId() { return id; }
//     public void setId(Long id) { this.id = id; }

//     public Long getBookingId() { return bookingId; }
//     public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

//     public Long getCustomerId() { return customerId; }
//     public void setCustomerId(Long customerId) { this.customerId = customerId; }

//     public Long getProviderId() { return providerId; }
//     public void setProviderId(Long providerId) { this.providerId = providerId; }

//     public Integer getRating() { return rating; }
//     public void setRating(Integer rating) { this.rating = rating; }

//     public String getComment() { return comment; }
//     public void setComment(String comment) { this.comment = comment; }

//     public LocalDateTime getCreatedAt() { return createdAt; }
//     public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
package com.fixitnow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", uniqueConstraints = {
    @UniqueConstraint(columnNames = "booking_id", name = "UK_REVIEW_BOOKING_ID")
})
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false, unique = true)
    private Long bookingId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "service_id")
    private Long serviceId;

    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}