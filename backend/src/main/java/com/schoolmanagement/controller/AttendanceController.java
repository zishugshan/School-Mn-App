package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.AttendanceRequest;
import com.schoolmanagement.dto.request.BulkAttendanceRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.AttendanceResponse;
import com.schoolmanagement.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<AttendanceResponse> markAttendance(@Valid @RequestBody AttendanceRequest request) {
        AttendanceResponse response = attendanceService.markAttendance(request);
        return ApiResponse.success(response, "Attendance marked successfully");
    }

    @PostMapping("/mark/bulk")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<List<AttendanceResponse>> markBulkAttendance(
            @Valid @RequestBody BulkAttendanceRequest request) {
        List<AttendanceResponse> responses = attendanceService.markBulkAttendance(request);
        return ApiResponse.success(responses, "Bulk attendance marked successfully");
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<AttendanceResponse>> getStudentAttendance(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceResponse> attendance = attendanceService.getStudentAttendance(studentId, startDate, endDate);
        return ApiResponse.success(attendance, "Attendance retrieved successfully");
    }

    @GetMapping("/class/{classId}/section/{sectionId}/date/{date}")
    public ApiResponse<List<AttendanceResponse>> getAttendanceByClassAndDate(
            @PathVariable Long classId,
            @PathVariable Long sectionId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceResponse> attendance = attendanceService.getAttendanceByClassAndDate(classId, sectionId, date);
        return ApiResponse.success(attendance, "Attendance retrieved successfully");
    }

    @GetMapping("/class/{classId}/section/{sectionId}/range")
    public ApiResponse<List<AttendanceResponse>> getAttendanceByClassAndDateRange(
            @PathVariable Long classId,
            @PathVariable Long sectionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceResponse> attendance = attendanceService.getAttendanceByClassAndDateRange(
                classId, sectionId, startDate, endDate);
        return ApiResponse.success(attendance, "Attendance retrieved successfully");
    }

    @GetMapping("/summary/class/{classId}/section/{sectionId}/date/{date}")
    public ApiResponse<Map<String, Object>> getAttendanceSummary(
            @PathVariable Long classId,
            @PathVariable Long sectionId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Map<String, Object> summary = attendanceService.getAttendanceSummary(classId, sectionId, date);
        return ApiResponse.success(summary, "Attendance summary retrieved successfully");
    }

    @GetMapping("/student/{studentId}/percentage")
    public ApiResponse<Double> getAttendancePercentage(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Double percentage = attendanceService.getAttendancePercentage(studentId, startDate, endDate);
        return ApiResponse.success(percentage, "Attendance percentage retrieved successfully");
    }
}
