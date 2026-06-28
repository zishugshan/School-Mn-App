package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.RemarkRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.RemarkResponse;
import com.schoolmanagement.service.RemarkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/remarks")
@RequiredArgsConstructor
public class RemarkController {

    private final RemarkService remarkService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT')")
    public ApiResponse<List<RemarkResponse>> getAllRemarks(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long teacherId) {
        List<RemarkResponse> remarks = remarkService.getAllRemarks(studentId, teacherId);
        return ApiResponse.success(remarks, "Remarks retrieved successfully");
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<RemarkResponse>> getRemarksByStudent(@PathVariable Long studentId) {
        List<RemarkResponse> remarks = remarkService.getRemarksByStudent(studentId);
        return ApiResponse.success(remarks, "Remarks retrieved successfully");
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<List<RemarkResponse>> getRemarksByTeacher(@PathVariable Long teacherId) {
        List<RemarkResponse> remarks = remarkService.getRemarksByTeacher(teacherId);
        return ApiResponse.success(remarks, "Remarks retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<RemarkResponse> addRemark(@Valid @RequestBody RemarkRequest request) {
        RemarkResponse remark = remarkService.addRemark(request);
        return ApiResponse.success(remark, "Remark added successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<Void> deleteRemark(@PathVariable Long id) {
        remarkService.deleteRemark(id);
        return ApiResponse.success(null, "Remark deleted successfully");
    }
}
