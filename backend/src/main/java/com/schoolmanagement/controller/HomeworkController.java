package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.HomeworkDoubtRequest;
import com.schoolmanagement.dto.request.HomeworkRequest;
import com.schoolmanagement.dto.request.HomeworkSubmissionRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.HomeworkDoubtResponse;
import com.schoolmanagement.dto.response.HomeworkResponse;
import com.schoolmanagement.dto.response.HomeworkSubmissionResponse;
import com.schoolmanagement.entity.enums.HomeworkStatus;
import com.schoolmanagement.service.HomeworkService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/homework")
@RequiredArgsConstructor
public class HomeworkController {

    private final HomeworkService homeworkService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<HomeworkResponse> createHomework(@Valid @RequestBody HomeworkRequest request) {
        HomeworkResponse response = homeworkService.createHomework(request);
        return ApiResponse.success(response, "Homework created successfully");
    }

    @GetMapping("/teacher/{teacherId}")
    public ApiResponse<List<HomeworkResponse>> getHomeworkByTeacher(@PathVariable Long teacherId) {
        List<HomeworkResponse> homework = homeworkService.getHomeworkByTeacher(teacherId);
        return ApiResponse.success(homework, "Homework retrieved successfully");
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<HomeworkResponse>> getHomeworkByStudent(@PathVariable Long studentId) {
        List<HomeworkResponse> homework = homeworkService.getHomeworkByStudent(studentId);
        return ApiResponse.success(homework, "Homework retrieved successfully");
    }

    @GetMapping("/class/{classId}")
    public ApiResponse<List<HomeworkResponse>> getHomeworkByClass(@PathVariable Long classId) {
        List<HomeworkResponse> homework = homeworkService.getHomeworkByClass(classId);
        return ApiResponse.success(homework, "Homework retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<HomeworkResponse> getHomeworkById(@PathVariable Long id) {
        HomeworkResponse homework = homeworkService.getHomeworkById(id);
        return ApiResponse.success(homework, "Homework retrieved successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<HomeworkResponse> updateHomework(
            @PathVariable Long id, @Valid @RequestBody HomeworkRequest request) {
        HomeworkResponse homework = homeworkService.updateHomework(id, request);
        return ApiResponse.success(homework, "Homework updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<Void> deleteHomework(@PathVariable Long id) {
        homeworkService.deleteHomework(id);
        return ApiResponse.success(null, "Homework deleted successfully");
    }

    @PostMapping("/submit")
    public ApiResponse<HomeworkSubmissionResponse> submitHomework(
            @Valid @RequestBody HomeworkSubmissionRequest request) {
        HomeworkSubmissionResponse response = homeworkService.submitHomework(request);
        return ApiResponse.success(response, "Homework submitted successfully");
    }

    @GetMapping("/submissions/homework/{homeworkId}")
    public ApiResponse<List<HomeworkSubmissionResponse>> getSubmissionsByHomework(
            @PathVariable Long homeworkId) {
        List<HomeworkSubmissionResponse> submissions = homeworkService.getSubmissionsByHomework(homeworkId);
        return ApiResponse.success(submissions, "Submissions retrieved successfully");
    }

    @GetMapping("/submissions/student/{studentId}")
    public ApiResponse<List<HomeworkSubmissionResponse>> getSubmissionsByStudent(
            @PathVariable Long studentId) {
        List<HomeworkSubmissionResponse> submissions = homeworkService.getSubmissionsByStudent(studentId);
        return ApiResponse.success(submissions, "Submissions retrieved successfully");
    }

    @GetMapping("/submissions/student/{studentId}/status/{status}")
    public ApiResponse<List<HomeworkSubmissionResponse>> getSubmissionsByStudentAndStatus(
            @PathVariable Long studentId, @PathVariable HomeworkStatus status) {
        List<HomeworkSubmissionResponse> submissions =
                homeworkService.getSubmissionsByStudentAndStatus(studentId, status);
        return ApiResponse.success(submissions, "Submissions retrieved successfully");
    }

    // ── Doubt endpoints ────────────────────────────────────────

    @GetMapping("/{homeworkId}/doubts")
    public ApiResponse<List<HomeworkDoubtResponse>> getDoubts(@PathVariable Long homeworkId) {
        List<HomeworkDoubtResponse> doubts = homeworkService.getDoubtsByHomework(homeworkId);
        return ApiResponse.success(doubts, "Doubts retrieved successfully");
    }

    @PostMapping("/{homeworkId}/doubts")
    public ApiResponse<HomeworkDoubtResponse> createDoubt(
            @PathVariable Long homeworkId,
            @Valid @RequestBody HomeworkDoubtRequest request) {
        HomeworkDoubtResponse doubt = homeworkService.createDoubt(request, homeworkId);
        return ApiResponse.success(doubt, "Doubt created successfully");
    }

    @PutMapping("/doubts/{doubtId}/resolve")
    public ApiResponse<HomeworkDoubtResponse> resolveDoubt(@PathVariable Long doubtId) {
        HomeworkDoubtResponse doubt = homeworkService.resolveDoubt(doubtId);
        return ApiResponse.success(doubt, "Doubt resolved successfully");
    }

    @PutMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<HomeworkSubmissionResponse> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestParam BigDecimal score,
            @RequestParam String feedback) {
        HomeworkSubmissionResponse response = homeworkService.gradeSubmission(submissionId, score, feedback);
        return ApiResponse.success(response, "Submission graded successfully");
    }
}
