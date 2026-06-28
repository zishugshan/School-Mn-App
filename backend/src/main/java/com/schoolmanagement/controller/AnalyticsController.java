package com.schoolmanagement.controller;

import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/attendance/trends")
    public ApiResponse<Map<String, Object>> getAttendanceTrends(
            @RequestParam Long classId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam int year) {
        Map<String, Object> trends = analyticsService.getAttendanceTrends(classId, sectionId, year);
        return ApiResponse.success(trends, "Attendance trends retrieved successfully");
    }

    @GetMapping("/performance/subject")
    public ApiResponse<Map<String, Object>> getSubjectPerformance(
            @RequestParam Long classId, @RequestParam Long subjectId) {
        Map<String, Object> performance = analyticsService.getSubjectPerformance(classId, subjectId);
        return ApiResponse.success(performance, "Subject performance retrieved successfully");
    }

    @GetMapping("/homework/completion")
    public ApiResponse<Map<String, Object>> getHomeworkCompletionTrends(
            @RequestParam Long classId, @RequestParam int year) {
        Map<String, Object> trends = analyticsService.getHomeworkCompletionTrends(classId, year);
        return ApiResponse.success(trends, "Homework completion trends retrieved successfully");
    }

    @GetMapping("/class/performance")
    public ApiResponse<Map<String, Object>> getClassPerformance(
            @RequestParam Long classId, @RequestParam int year) {
        Map<String, Object> performance = analyticsService.getClassPerformance(classId, year);
        return ApiResponse.success(performance, "Class performance retrieved successfully");
    }

    @GetMapping("/school/performance")
    public ApiResponse<Map<String, Object>> getSchoolPerformance(@RequestParam int year) {
        Map<String, Object> performance = analyticsService.getSchoolPerformance(year);
        return ApiResponse.success(performance, "School performance retrieved successfully");
    }
}
