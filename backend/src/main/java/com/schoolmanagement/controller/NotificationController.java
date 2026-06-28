package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.NotificationRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.NotificationResponse;
import com.schoolmanagement.dto.response.PageResponse;
import com.schoolmanagement.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ApiResponse<PageResponse<NotificationResponse>> getUserNotifications(
            @PathVariable Long userId, @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<NotificationResponse> notifications =
                notificationService.getUserNotifications(userId, pageable);
        return ApiResponse.success(notifications, "Notifications retrieved successfully");
    }

    @GetMapping("/user/{userId}/unread/count")
    public ApiResponse<Long> getUnreadCount(@PathVariable Long userId) {
        Long count = notificationService.getUnreadCount(userId);
        return ApiResponse.success(count, "Unread count retrieved successfully");
    }

    @PutMapping("/{notificationId}/user/{userId}/read")
    public ApiResponse<Void> markAsRead(
            @PathVariable Long notificationId, @PathVariable Long userId) {
        notificationService.markAsRead(notificationId, userId);
        return ApiResponse.success(null, "Notification marked as read");
    }

    @PutMapping("/user/{userId}/read-all")
    public ApiResponse<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ApiResponse.success(null, "All notifications marked as read");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<NotificationResponse> sendNotification(
            @Valid @RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.sendNotification(request);
        return ApiResponse.success(response, "Notification sent successfully");
    }

    @PostMapping("/global")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> sendGlobalNotification(@Valid @RequestBody NotificationRequest request) {
        notificationService.sendGlobalNotification(request);
        return ApiResponse.success(null, "Global notification sent successfully");
    }
}
