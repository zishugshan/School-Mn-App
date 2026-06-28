package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.BulkMarksRequest;
import com.schoolmanagement.dto.request.TestRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.MarksResponse;
import com.schoolmanagement.dto.response.TestResponse;
import com.schoolmanagement.service.TestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<TestResponse> createTest(@Valid @RequestBody TestRequest request) {
        TestResponse response = testService.createTest(request);
        return ApiResponse.success(response, "Test created successfully");
    }

    @GetMapping("/teacher/{teacherId}")
    public ApiResponse<List<TestResponse>> getTestsByTeacher(@PathVariable Long teacherId) {
        List<TestResponse> tests = testService.getTestsByTeacher(teacherId);
        return ApiResponse.success(tests, "Tests retrieved successfully");
    }

    @GetMapping("/class/{classId}")
    public ApiResponse<List<TestResponse>> getTestsByClass(@PathVariable Long classId) {
        List<TestResponse> tests = testService.getTestsByClass(classId);
        return ApiResponse.success(tests, "Tests retrieved successfully");
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<TestResponse>> getTestsByStudent(@PathVariable Long studentId) {
        List<TestResponse> tests = testService.getTestsByStudent(studentId);
        return ApiResponse.success(tests, "Tests retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<TestResponse> getTestById(@PathVariable Long id) {
        TestResponse test = testService.getTestById(id);
        return ApiResponse.success(test, "Test retrieved successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<TestResponse> updateTest(
            @PathVariable Long id, @Valid @RequestBody TestRequest request) {
        TestResponse test = testService.updateTest(id, request);
        return ApiResponse.success(test, "Test updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<Void> deleteTest(@PathVariable Long id) {
        testService.deleteTest(id);
        return ApiResponse.success(null, "Test deleted successfully");
    }

    @PostMapping("/{testId}/publish")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<Void> publishTest(@PathVariable Long testId) {
        testService.publishTest(testId);
        return ApiResponse.success(null, "Test published successfully");
    }

    @PostMapping("/{testId}/marks")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<List<MarksResponse>> enterMarks(@Valid @RequestBody BulkMarksRequest request) {
        List<MarksResponse> marks = testService.enterMarks(request);
        return ApiResponse.success(marks, "Marks entered successfully");
    }

    @GetMapping("/{testId}/marks")
    public ApiResponse<List<MarksResponse>> getMarksByTest(@PathVariable Long testId) {
        List<MarksResponse> marks = testService.getMarksByTest(testId);
        return ApiResponse.success(marks, "Marks retrieved successfully");
    }

    @GetMapping("/{testId}/marks/student/{studentId}")
    public ApiResponse<MarksResponse> getMarksByTestAndStudent(
            @PathVariable Long testId, @PathVariable Long studentId) {
        MarksResponse marks = testService.getMarksByTestAndStudent(testId, studentId);
        return ApiResponse.success(marks, "Marks retrieved successfully");
    }

    @GetMapping("/{testId}/leaderboard")
    public ApiResponse<List<MarksResponse>> getTestLeaderboard(@PathVariable Long testId) {
        List<MarksResponse> leaderboard = testService.getTestLeaderboard(testId);
        return ApiResponse.success(leaderboard, "Leaderboard retrieved successfully");
    }
}
