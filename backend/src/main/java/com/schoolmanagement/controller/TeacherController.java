package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.TeacherRequest;
import com.schoolmanagement.dto.request.UpdateTeacherRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.PageResponse;
import com.schoolmanagement.dto.response.TeacherDashboardResponse;
import com.schoolmanagement.dto.response.TeacherResponse;
import com.schoolmanagement.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    public ApiResponse<PageResponse<TeacherResponse>> getAllTeachers(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(defaultValue = "") String search) {
        PageResponse<TeacherResponse> teachers = teacherService.getAllTeachers(pageable, search);
        return ApiResponse.success(teachers, "Teachers retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<TeacherResponse> getTeacherById(@PathVariable Long id) {
        TeacherResponse teacher = teacherService.getTeacherById(id);
        return ApiResponse.success(teacher, "Teacher retrieved successfully");
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<TeacherResponse> getTeacherByUserId(@PathVariable Long userId) {
        TeacherResponse teacher = teacherService.getTeacherByUserId(userId);
        return ApiResponse.success(teacher, "Teacher retrieved successfully");
    }

    @GetMapping("/{id}/classes")
    public ApiResponse<List<Map<String, Object>>> getTeacherClasses(@PathVariable Long id) {
        List<Map<String, Object>> classes = teacherService.getTeacherClasses(id);
        return ApiResponse.success(classes, "Classes retrieved successfully");
    }

    @GetMapping("/{id}/dashboard")
    public ApiResponse<TeacherDashboardResponse> getTeacherDashboard(@PathVariable Long id) {
        TeacherDashboardResponse dashboard = teacherService.getTeacherDashboard(id);
        return ApiResponse.success(dashboard, "Dashboard retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<TeacherResponse> createTeacher(@Valid @RequestBody TeacherRequest request) {
        TeacherResponse teacher = teacherService.createTeacher(request);
        return ApiResponse.success(teacher, "Teacher created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<TeacherResponse> updateTeacher(
            @PathVariable Long id, @Valid @RequestBody UpdateTeacherRequest request) {
        TeacherResponse teacher = teacherService.updateTeacher(id, request);
        return ApiResponse.success(teacher, "Teacher updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ApiResponse.success(null, "Teacher deleted successfully");
    }

    @PostMapping("/{teacherId}/subjects/{subjectId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> assignSubject(
            @PathVariable Long teacherId, @PathVariable Long subjectId) {
        teacherService.assignSubject(teacherId, subjectId);
        return ApiResponse.success(null, "Subject assigned successfully");
    }

    @DeleteMapping("/{teacherId}/subjects/{subjectId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> removeSubject(
            @PathVariable Long teacherId, @PathVariable Long subjectId) {
        teacherService.removeSubject(teacherId, subjectId);
        return ApiResponse.success(null, "Subject removed successfully");
    }
}
