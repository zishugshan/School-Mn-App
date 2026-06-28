package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.NotificationRequest;
import com.schoolmanagement.dto.response.NotificationResponse;
import com.schoolmanagement.dto.response.PageResponse;
import com.schoolmanagement.entity.Notification;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.entity.UserNotification;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.NotificationRepository;
import com.schoolmanagement.repository.UserNotificationRepository;
import com.schoolmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final UserRepository userRepository;

    public NotificationResponse sendNotification(NotificationRequest request) {
        User createdBy = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getCreatedBy()));

        Notification notification = Notification.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .isGlobal(false)
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .createdBy(createdBy)
                .build();

        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    public void sendNotificationToUser(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserNotification userNotification = UserNotification.builder()
                .notification(notification)
                .user(user)
                .isRead(false)
                .build();

        userNotificationRepository.save(userNotification);
    }

    public void sendNotificationToMultipleUsers(Long notificationId, List<Long> userIds) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        List<User> users = userRepository.findAllById(userIds);
        List<UserNotification> userNotifications = users.stream()
                .map(user -> UserNotification.builder()
                        .notification(notification)
                        .user(user)
                        .isRead(false)
                        .build())
                .collect(Collectors.toList());

        userNotificationRepository.saveAll(userNotifications);
    }

    public NotificationResponse sendGlobalNotification(NotificationRequest request) {
        User createdBy = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getCreatedBy()));

        Notification notification = Notification.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .isGlobal(true)
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .createdBy(createdBy)
                .build();

        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    public PageResponse<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        List<UserNotification> userNotifications = userNotificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);

        List<NotificationResponse> responses = userNotifications.stream()
                .map(un -> NotificationResponse.builder()
                        .id(un.getNotification().getId())
                        .title(un.getNotification().getTitle())
                        .message(un.getNotification().getMessage())
                        .type(un.getNotification().getType() != null
                                ? un.getNotification().getType().name() : null)
                        .isRead(un.getIsRead() != null && un.getIsRead())
                        .referenceId(un.getNotification().getReferenceId())
                        .referenceType(un.getNotification().getReferenceType())
                        .createdAt(un.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());
        List<NotificationResponse> content = start > responses.size()
                ? List.of() : responses.subList(start, end);

        return PageResponse.<NotificationResponse>builder()
                .content(content)
                .page(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .totalElements(responses.size())
                .totalPages((int) Math.ceil((double) responses.size() / pageable.getPageSize()))
                .last(end >= responses.size())
                .build();
    }

    public long getUnreadCount(Long userId) {
        return userNotificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public long getUnreadNotificationCount(Long userId) {
        return getUnreadCount(userId);
    }

    public void markAsRead(Long notificationId, Long userId) {
        List<UserNotification> userNotifications = userNotificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);

        userNotifications.stream()
                .filter(un -> un.getNotification().getId().equals(notificationId))
                .findFirst()
                .ifPresent(un -> {
                    un.setIsRead(true);
                    un.setReadAt(LocalDateTime.now());
                    userNotificationRepository.save(un);
                });
    }

    public void markAllAsRead(Long userId) {
        userNotificationRepository.markAllAsReadByUserId(userId);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType() != null ? notification.getType().name() : null)
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
