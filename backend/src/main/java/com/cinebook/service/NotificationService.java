package com.cinebook.service;

import com.cinebook.model.Notification;
import com.cinebook.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
        if (userId == null) {
            return notificationRepository.findAllByOrderByCreatedAtDesc();
        }

        String normRole = (role != null && !role.isBlank()) ? role.trim().toLowerCase() : null;
        String normBranch = (branchId != null && !branchId.isBlank()) ? branchId.trim() : null;

        try {
            return notificationRepository.findUserNotifications(userId, normRole, normBranch);
        } catch (Exception e) {
            // Fallback in-memory filter
            List<Notification> all = notificationRepository.findAllByOrderByCreatedAtDesc();
            return all.stream().filter(n -> {
                if (n.getUserId() != null && n.getUserId().equals(userId)) return true;
                if (n.getUserId() == null) {
                    if ("all".equalsIgnoreCase(n.getAudience())) return true;
                    if ("role".equalsIgnoreCase(n.getAudience()) && normRole != null && normRole.equalsIgnoreCase(n.getAudienceTarget())) return true;
                    if ("branch".equalsIgnoreCase(n.getAudience()) && normBranch != null && normBranch.equalsIgnoreCase(n.getAudienceTarget())) return true;
                }
                return false;
            }).collect(Collectors.toList());
        }
    }

    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
    }

    public Notification createNotification(Notification notification) {
        notification.setId(null);
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        if (notification.getUserId() != null) {
            if (notification.getAudience() == null || notification.getAudience().isBlank() || "all".equalsIgnoreCase(notification.getAudience())) {
                notification.setAudience("user");
            }
        } else {
            if (notification.getAudience() == null || notification.getAudience().isBlank()) {
                notification.setAudience("all");
            }
        }
        if (notification.getStatus() == null || notification.getStatus().isBlank()) {
            notification.setStatus("sent");
        }
        return notificationRepository.save(notification);
    }

    public List<Notification> broadcastNotification(Notification template, List<Long> targetUserIds) {
        LocalDateTime now = LocalDateTime.now();
        List<Notification> result = new ArrayList<>();

        if (targetUserIds != null && !targetUserIds.isEmpty()) {
            for (Long uid : targetUserIds) {
                if (uid == null) continue;
                Notification n = new Notification();
                n.setUserId(uid);
                n.setType(template.getType() != null ? template.getType() : "system_announcement");
                n.setTitle(template.getTitle());
                n.setMessage(template.getMessage());
                n.setLink(template.getLink());
                n.setAudience(template.getAudience() != null ? template.getAudience() : "user");
                n.setAudienceTarget(template.getAudienceTarget());
                n.setCreatedBy(template.getCreatedBy());
                n.setStatus("sent");
                n.setRead(false);
                n.setCreatedAt(now);
                result.add(notificationRepository.save(n));
            }
        } else {
            template.setId(null);
            template.setUserId(null);
            template.setCreatedAt(now);
            if (template.getAudience() == null || template.getAudience().isBlank()) {
                template.setAudience("all");
            }
            template.setStatus("sent");
            template.setRead(false);
            result.add(notificationRepository.save(template));
        }

        return result;
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
