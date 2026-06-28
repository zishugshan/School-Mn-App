package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestResponse {

    private Long id;
    private String title;
    private String description;
    private String subjectName;
    private String className;
    private String sectionName;
    private String teacherName;
    private BigDecimal maximumMarks;
    private BigDecimal passingMarks;
    private LocalDate testDate;
    private String examType;
    private boolean isPublished;
    private LocalDateTime createdAt;
}
