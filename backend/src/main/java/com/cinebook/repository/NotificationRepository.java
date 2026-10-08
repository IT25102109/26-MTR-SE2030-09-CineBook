package com.cinebook.repository;

import com.cinebook.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId " +
           "OR (n.userId IS NULL AND (" +
           "  LOWER(n.audience) = 'all' " +
           "  OR (:role IS NOT NULL AND LOWER(n.audience) = 'role' AND LOWER(n.audienceTarget) = LOWER(:role)) " +
           "  OR (:branchId IS NOT NULL AND LOWER(n.audience) = 'branch' AND n.audienceTarget = :branchId)" +
           ")) ORDER BY n.createdAt DESC")
    List<Notification> findUserNotifications(@Param("userId") Long userId,
                                            @Param("role") String role,
                                            @Param("branchId") String branchId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.status = 'read' WHERE n.userId = :userId")
    void markAllAsReadForUser(@Param("userId") Long userId);
}
