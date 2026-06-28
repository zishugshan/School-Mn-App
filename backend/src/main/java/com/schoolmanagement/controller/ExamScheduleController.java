package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.ExamScheduleRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.ExamScheduleResponse;
import com.schoolmanagement.service.ExamScheduleService;
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
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamScheduleController {

    private final ExamScheduleService examScheduleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<ExamScheduleResponse> createExam(@Valid @RequestBody ExamScheduleRequest request) {
        ExamScheduleResponse response = examScheduleService.createExam(request);
        return ApiResponse.success(response, "Exam created successfully");
    }

    @GetMapping
    public ApiResponse<List<ExamScheduleResponse>> getAllExams() {
        List<ExamScheduleResponse> exams = examScheduleService.getAllExams();
        return ApiResponse.success(exams, "Exams retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<ExamScheduleResponse> getExamById(@PathVariable Long id) {
        ExamScheduleResponse exam = examScheduleService.getExamById(id);
        return ApiResponse.success(exam, "Exam retrieved successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<ExamScheduleResponse> updateExam(
            @PathVariable Long id, @Valid @RequestBody ExamScheduleRequest request) {
        ExamScheduleResponse exam = examScheduleService.updateExam(id, request);
        return ApiResponse.success(exam, "Exam updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> deleteExam(@PathVariable Long id) {
        examScheduleService.deleteExam(id);
        return ApiResponse.success(null, "Exam deleted successfully");
    }

    @GetMapping("/my-schedule")
    public ApiResponse<List<ExamScheduleResponse>> getMySchedule() {
        List<ExamScheduleResponse> exams = examScheduleService.getMySchedule();
        return ApiResponse.success(exams, "My schedule retrieved successfully");
    }
}
