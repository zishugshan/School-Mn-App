package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.StudentRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.PageResponse;
import com.schoolmanagement.dto.response.StudentDashboardResponse;
import com.schoolmanagement.dto.response.StudentResponse;
import com.schoolmanagement.service.StudentService;
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

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ApiResponse<PageResponse<StudentResponse>> getAllStudents(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(defaultValue = "") String search) {
        PageResponse<StudentResponse> students = studentService.getAllStudents(pageable, search);
        return ApiResponse.success(students, "Students retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<StudentResponse> getStudentById(@PathVariable Long id) {
        StudentResponse student = studentService.getStudentById(id);
        return ApiResponse.success(student, "Student retrieved successfully");
    }

    @GetMapping("/code/{code}")
    public ApiResponse<StudentResponse> getStudentByCode(@PathVariable String code) {
        StudentResponse student = studentService.getStudentByCode(code);
        return ApiResponse.success(student, "Student retrieved successfully");
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<StudentResponse> getStudentByUserId(@PathVariable Long userId) {
        StudentResponse student = studentService.getStudentByUserId(userId);
        return ApiResponse.success(student, "Student retrieved successfully");
    }

    @GetMapping("/{id}/dashboard")
    public ApiResponse<StudentDashboardResponse> getStudentDashboard(@PathVariable Long id) {
        StudentDashboardResponse dashboard = studentService.getStudentDashboard(id);
        return ApiResponse.success(dashboard, "Dashboard retrieved successfully");
    }

    @GetMapping("/class/{classId}/section/{sectionId}")
    public ApiResponse<List<StudentResponse>> getStudentsByClassAndSection(
            @PathVariable Long classId, @PathVariable Long sectionId) {
        List<StudentResponse> students = studentService.getStudentsByClassAndSection(classId, sectionId);
        return ApiResponse.success(students, "Students retrieved successfully");
    }

    @GetMapping("/class/{classId}")
    public ApiResponse<List<StudentResponse>> getStudentsByClassId(@PathVariable Long classId) {
        List<StudentResponse> students = studentService.getStudentsByClassId(classId);
        return ApiResponse.success(students, "Students retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<StudentResponse> createStudent(@Valid @RequestBody StudentRequest request) {
        StudentResponse student = studentService.createStudent(request);
        return ApiResponse.success(student, "Student created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<StudentResponse> updateStudent(
            @PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        StudentResponse student = studentService.updateStudent(id, request);
        return ApiResponse.success(student, "Student updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ApiResponse.success(null, "Student deleted successfully");
    }
}
