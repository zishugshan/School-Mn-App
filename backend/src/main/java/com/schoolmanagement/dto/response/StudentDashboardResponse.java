package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDashboardResponse {

    private StudentResponse student;
    private Double attendancePercentage;
    private Double homeworkCompletionRate;
    private Double averageMarks;
    private Integer rankInClass;
    private List<MonthlyPerformance> monthlyPerformance;
    private List<HomeworkSummary> recentHomework;
    private List<TestSummary> upcomingTests;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyPerformance {
        private int year;
        private int month;
        private double attendanceRate;
        private double averageScore;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HomeworkSummary {
        private Long homeworkId;
        private String title;
        private String subjectName;
        private LocalDateTime dueDate;
        private BigDecimal maxScore;
        private BigDecimal score;
        private String status;
        private boolean isOverdue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TestSummary {
        private Long testId;
        private String title;
        private String subjectName;
        private LocalDate testDate;
        private BigDecimal maximumMarks;
        private String examType;
    }
}
