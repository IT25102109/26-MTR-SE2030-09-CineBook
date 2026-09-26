package com.cinebook.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Shared User entity. Every actor that logs in (Customer, Cinema Manager,
 * Admin) is represented here, distinguished by `role`. Owned jointly —
 * whichever module needs auth first should extend this carefully and
 * flag changes to the team, since Payment, Booking, and Admin Reporting
 * all depend on it.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonProperty("id")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("id")
    public void setJsonId(Object rawId) {
        if (rawId == null) {
            this.id = null;
        } else if (rawId instanceof Number number) {
            this.id = number.longValue();
        } else {
            String s = rawId.toString().trim();
            if (s.isEmpty() || !s.matches("\\d+")) {
                this.id = null;
            } else {
                this.id = Long.parseLong(s);
            }
        }
    }

    @Column(nullable = false)
    private String fullName;

    @com.fasterxml.jackson.annotation.JsonProperty("name")
    public String getName() {
        return fullName;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("name")
    public void setName(String name) {
        if (name != null) {
            this.fullName = name;
        }
    }

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password = "password123";

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.CUSTOMER;

    // Cinema Managers are scoped to a branch; null for Admin/Customer.
    private Long branchId;

    @Column(name = "loyalty_points")
    private Integer loyaltyPoints = 0;

    @Column(name = "membership_tier")
    private String membershipTier = "Bronze";

    @com.fasterxml.jackson.annotation.JsonProperty("loyaltyTier")
    public String getLoyaltyTier() {
        return membershipTier;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("loyaltyTier")
    public void setLoyaltyTier(String loyaltyTier) {
        if (loyaltyTier != null) {
            this.membershipTier = loyaltyTier;
        }
    }

    @Column(name = "avatar_color")
    private String avatarColor = "#F5C518";

    @com.fasterxml.jackson.annotation.JsonProperty("assignedBranchId")
    public String getAssignedBranchId() {
        return branchId != null ? branchId.toString() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("assignedBranchId")
    public void setAssignedBranchId(Object bId) {
        if (bId == null) {
            this.branchId = null;
        } else if (bId instanceof Number number) {
            this.branchId = number.longValue();
        } else {
            String s = bId.toString().trim();
            if (s.isEmpty() || !s.matches("\\d+")) {
                this.branchId = null;
            } else {
                this.branchId = Long.parseLong(s);
            }
        }
    }
}
