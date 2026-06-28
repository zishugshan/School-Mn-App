package com.schoolmanagement.controller;

import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.AuditLogResponse;
import com.schoolmanagement.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping("/user/{userId}")
    public ApiResponse<List<AuditLogResponse>> getLogsByUser(@PathVariable Long userId) {
        List<AuditLogResponse> logs = auditLogService.getLogsByUser(userId);
        return ApiResponse.success(logs, "Audit logs retrieved successfully");
    }

    @GetMapping
    public ApiResponse<List<AuditLogResponse>> getLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<AuditLogResponse> logs = auditLogService.getLogsByDateRange(start, end);
        return ApiResponse.success(logs, "Audit logs retrieved successfully");
    }
}
