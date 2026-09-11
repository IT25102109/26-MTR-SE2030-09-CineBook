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

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // store as a hash (e.g. BCrypt) — never plain text

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Cinema Managers are scoped to a branch; null for Admin/Customer.
    private Long branchId;
}
