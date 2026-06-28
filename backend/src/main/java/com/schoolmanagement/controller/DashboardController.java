package com.schoolmanagement.controller;

import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.StudentDashboardResponse;
import com.schoolmanagement.dto.response.TeacherDashboardResponse;
import com.schoolmanagement.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/student/{studentId}")
    public ApiResponse<StudentDashboardResponse> getStudentDashboard(@PathVariable Long studentId) {
        StudentDashboardResponse dashboard = dashboardService.getStudentDashboard(studentId);
        return ApiResponse.success(dashboard, "Dashboard retrieved successfully");
    }

    @GetMapping("/teacher/{teacherId}")
    public ApiResponse<TeacherDashboardResponse> getTeacherDashboard(@PathVariable Long teacherId) {
        TeacherDashboardResponse dashboard = dashboardService.getTeacherDashboard(teacherId);
        return ApiResponse.success(dashboard, "Dashboard retrieved successfully");
    }

    @GetMapping("/parent/{parentId}")
    public ApiResponse<Map<String, Object>> getParentDashboard(@PathVariable Long parentId) {
        Map<String, Object> dashboard = dashboardService.getParentDashboard(parentId);
        return ApiResponse.success(dashboard, "Dashboard retrieved successfully");
    }
}
