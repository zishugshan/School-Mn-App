package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactInquiryResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String schoolName;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
}
