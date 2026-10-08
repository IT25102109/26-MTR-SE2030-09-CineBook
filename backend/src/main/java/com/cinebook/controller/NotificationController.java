package com.cinebook.controller;

import com.cinebook.model.Notification;
import com.cinebook.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
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

    private Long parseNumericUserId(Object raw) {
        if (raw == null) return null;
        if (raw instanceof Number num) return num.longValue();
        String str = raw.toString().trim();
        if (str.isEmpty()) return null;
        if (str.matches("\\d+")) return Long.parseLong(str);
        String digits = str.replaceAll("\\D+", "");
        return digits.isEmpty() ? null : Long.parseLong(digits);
    }

    @GetMapping
    public List<Notification> getNotifications(
            @RequestParam(required = false) Object userId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String branchId) {
        Long parsedUserId = parseNumericUserId(userId);
        if (parsedUserId != null || role != null || branchId != null) {
            return notificationService.getUserNotifications(parsedUserId, role, branchId);
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

    @PostMapping("/broadcast")
    public List<Notification> broadcastNotification(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        Map<String, Object> notifMap = (Map<String, Object>) body.get("notification");

        Notification template = new Notification();
        if (notifMap != null) {
            template.setType((String) notifMap.getOrDefault("type", "system_announcement"));
            template.setTitle((String) notifMap.getOrDefault("title", ""));
            template.setMessage((String) notifMap.getOrDefault("message", ""));
            template.setLink((String) notifMap.get("link"));
            template.setAudience((String) notifMap.getOrDefault("audience", "all"));
            template.setAudienceTarget((String) notifMap.get("audienceTarget"));
            template.setCreatedBy(parseNumericUserId(notifMap.get("createdBy")));
        } else {
            template.setType((String) body.getOrDefault("type", "system_announcement"));
            template.setTitle((String) body.getOrDefault("title", ""));
            template.setMessage((String) body.getOrDefault("message", ""));
            template.setLink((String) body.get("link"));
            template.setAudience((String) body.getOrDefault("audience", "all"));
            template.setAudienceTarget((String) body.get("audienceTarget"));
            template.setCreatedBy(parseNumericUserId(body.get("createdBy")));
        }

        List<Long> targetUserIds = new ArrayList<>();
        Object rawTargets = body.get("targetUserIds");
        if (rawTargets instanceof List<?> list) {
            for (Object item : list) {
                Long uid = parseNumericUserId(item);
                if (uid != null) {
                    targetUserIds.add(uid);
                }
            }
        }

        return notificationService.broadcastNotification(template, targetUserIds);
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @PutMapping("/read-all")
    public void markAllAsRead(@RequestParam(required = false) Object userId, @RequestBody(required = false) Map<String, Object> body) {
        Long targetUserId = parseNumericUserId(userId);
        if (targetUserId == null && body != null && body.containsKey("userId")) {
            targetUserId = parseNumericUserId(body.get("userId"));
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
