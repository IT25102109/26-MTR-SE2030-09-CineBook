package com.cinebook.service;

import com.cinebook.model.Notification;
import com.cinebook.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Notification> getUserNotifications(Long userId, String role, String branchId) {
        List<Notification> all = notificationRepository.findAllByOrderByCreatedAtDesc();
        if (userId == null) {
            return all;
        }

        String normRole = role != null ? role.trim().toLowerCase() : "";
        String normBranch = branchId != null ? branchId.trim() : "";

        return all.stream().filter(n -> {
            // 1. Direct recipient
            if (n.getUserId() != null && n.getUserId().equals(userId)) {
                return true;
            }
            // 2. Audience: all
            if ("all".equalsIgnoreCase(n.getAudience())) {
                return true;
            }
            // 3. Audience: role
            if ("role".equalsIgnoreCase(n.getAudience()) && !normRole.isEmpty()) {
                if (normRole.equalsIgnoreCase(n.getAudienceTarget())) {
                    return true;
                }
            }
            // 4. Audience: branch
            if ("branch".equalsIgnoreCase(n.getAudience()) && !normBranch.isEmpty()) {
                if (normBranch.equalsIgnoreCase(n.getAudienceTarget())) {
                    return true;
                }
            }
            return false;
        }).collect(Collectors.toList());
    }

    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
    }

    public Notification createNotification(Notification notification) {
        notification.setId(null);
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Long id) {
        Notification notification = getNotificationById(id);
        notification.setRead(true);
        if ("sent".equalsIgnoreCase(notification.getStatus())) {
            notification.setStatus("read");
        }
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        if (userId != null) {
            notificationRepository.markAllAsReadForUser(userId);
        }
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
