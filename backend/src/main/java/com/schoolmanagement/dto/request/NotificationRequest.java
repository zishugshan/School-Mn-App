package com.schoolmanagement.dto.request;

import com.schoolmanagement.entity.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    private NotificationType type;

    private Long recipientUserId;
    private Long referenceId;
    private String referenceType;
    private Long createdBy;
}
