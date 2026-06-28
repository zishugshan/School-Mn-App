package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarksResponse {

    private Long id;
    private Long testId;
    private String testName;
    private Long studentId;
    private String studentName;
    private String studentCode;
    private BigDecimal marksObtained;
    private BigDecimal maximumMarks;
    private String remarks;
    private LocalDateTime createdAt;
}
