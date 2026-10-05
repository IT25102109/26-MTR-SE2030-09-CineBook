package com.cinebook.service;

import com.cinebook.model.Role;
import com.cinebook.model.User;
import com.cinebook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Transactional
    public User createUser(User user) {
        user.setId(null);

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        String cleanEmail = user.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new IllegalArgumentException("A user with email '" + cleanEmail + "' already exists.");
        }
        user.setEmail(cleanEmail);

        // Single Admin Rule: Only one admin can exist in the system
        if (user.getRole() == Role.ADMIN) {
            long existingAdminCount = userRepository.countByRole(Role.ADMIN);
            if (existingAdminCount >= 1) {
                throw new IllegalArgumentException("Only one admin can exist in the system.");
            }
        }

        String rawPassword = (user.getPassword() == null || user.getPassword().isBlank())
                ? "password123"
                : user.getPassword();

        if (!rawPassword.startsWith("$2a$") && !rawPassword.startsWith("$2b$") && !rawPassword.startsWith("$2y$")) {
            user.setPassword(passwordEncoder.encode(rawPassword));
        } else {
            user.setPassword(rawPassword);
        }

        if (user.getLoyaltyPoints() == null) {
            user.setLoyaltyPoints(0);
        }
        if (user.getMembershipTier() == null) {
            user.setMembershipTier("Bronze");
        }
        if (user.getAvatarColor() == null) {
            user.setAvatarColor("#F5C518");
        }
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);

        if (userDetails.getEmail() != null && !userDetails.getEmail().isBlank()) {
            String newEmail = userDetails.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailIgnoreCase(newEmail)) {
                throw new IllegalArgumentException("A user with email '" + newEmail + "' already exists.");
            }
            user.setEmail(newEmail);
        }

        if (userDetails.getRole() != null) {
            // Check if promoting non-admin to admin when an admin already exists
            if (userDetails.getRole() == Role.ADMIN && user.getRole() != Role.ADMIN) {
                long existingAdminCount = userRepository.countByRole(Role.ADMIN);
                if (existingAdminCount >= 1) {
                    throw new IllegalArgumentException("Only one admin can exist in the system.");
                }
            } else if (user.getRole() == Role.ADMIN && userDetails.getRole() != Role.ADMIN) {
                // Prevent removing role from the only admin
                long existingAdminCount = userRepository.countByRole(Role.ADMIN);
                if (existingAdminCount <= 1) {
                    throw new IllegalArgumentException("Cannot change the role of the only admin in the system.");
                }
            }
            user.setRole(userDetails.getRole());
        }

        if (userDetails.getFullName() != null) user.setFullName(userDetails.getFullName());
        if (userDetails.getBranchId() != null) {
            user.setBranchId(userDetails.getBranchId());
        } else if (userDetails.getRole() != null && userDetails.getRole() != Role.CINEMA_MANAGER) {
            user.setBranchId(null);
        }

        if (userDetails.getLoyaltyPoints() != null) user.setLoyaltyPoints(userDetails.getLoyaltyPoints());
        if (userDetails.getMembershipTier() != null) user.setMembershipTier(userDetails.getMembershipTier());
        if (userDetails.getAvatarColor() != null) user.setAvatarColor(userDetails.getAvatarColor());
        if (userDetails.getPhone() != null) user.setPhone(userDetails.getPhone());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
            String rawPassword = userDetails.getPassword();
            if (!rawPassword.startsWith("$2a$") && !rawPassword.startsWith("$2b$") && !rawPassword.startsWith("$2y$")) {
                user.setPassword(passwordEncoder.encode(rawPassword));
            } else {
                user.setPassword(rawPassword);
            }
        }
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Cannot delete the only admin in the system.");
        }
        userRepository.deleteById(id);
    }
}
