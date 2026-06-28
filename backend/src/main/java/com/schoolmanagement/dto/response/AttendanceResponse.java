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
public class AttendanceResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentCode;
    private String className;
    private String sectionName;
    private LocalDate date;
    private String status;
    private String remarks;
    private boolean isQrAttendance;
    private LocalDateTime createdAt;
}
