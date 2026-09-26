package com.cinebook.service;

import com.cinebook.model.User;
import com.cinebook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User createUser(User user) {
        user.setId(null);
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            user.setPassword("password123");
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

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        if (userDetails.getFullName() != null) user.setFullName(userDetails.getFullName());
        if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
        if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
        if (userDetails.getBranchId() != null) user.setBranchId(userDetails.getBranchId());
        if (userDetails.getLoyaltyPoints() != null) user.setLoyaltyPoints(userDetails.getLoyaltyPoints());
        if (userDetails.getMembershipTier() != null) user.setMembershipTier(userDetails.getMembershipTier());
        if (userDetails.getAvatarColor() != null) user.setAvatarColor(userDetails.getAvatarColor());
        if (userDetails.getPhone() != null) user.setPhone(userDetails.getPhone());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
            user.setPassword(userDetails.getPassword());
        }
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

