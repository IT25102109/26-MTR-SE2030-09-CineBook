package com.cinebook.controller;

import com.cinebook.model.Notification;
import com.cinebook.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Notification> getNotifications(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String branchId) {
        if (userId != null || role != null || branchId != null) {
            return notificationService.getUserNotifications(userId, role, branchId);
        }
        return notificationService.getAllNotifications();
    }

    @GetMapping("/{id}")
    public Notification getNotificationById(@PathVariable Long id) {
        return notificationService.getNotificationById(id);
    }

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        return notificationService.createNotification(notification);
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @PutMapping("/read-all")
    public void markAllAsRead(@RequestParam(required = false) Long userId, @RequestBody(required = false) Map<String, Object> body) {
        Long targetUserId = userId;
        if (targetUserId == null && body != null && body.containsKey("userId")) {
            Object raw = body.get("userId");
            if (raw instanceof Number num) {
                targetUserId = num.longValue();
            } else if (raw != null) {
                String digits = raw.toString().replaceAll("\\D+", "");
                if (!digits.isEmpty()) {
                    targetUserId = Long.parseLong(digits);
                }
            }
        }
        if (targetUserId != null) {
            notificationService.markAllAsRead(targetUserId);
        }
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }
}

