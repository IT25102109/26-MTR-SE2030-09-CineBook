package com.cinebook.model;

/**
 * RBAC role hierarchy for CineBook: Admin ⊃ Cinema Manager ⊃ Customer.
 * Admin is a superset (Head Office) role with system-wide access;
 * Cinema Manager is scoped to their branch; Customer is the base role.
 */
public enum Role {
    ADMIN,
    CINEMA_MANAGER,
    CUSTOMER
}
