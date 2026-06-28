package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentCode;
    private String certificateType;
    private String description;
    private String issuedBy;
    private String academicYear;
    private LocalDate issueDate;
    private LocalDateTime createdAt;
}
