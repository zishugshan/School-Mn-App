package com.schoolmanagement.controller;

import com.schoolmanagement.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping(value = "/student/{studentId}/report-card", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public byte[] generateStudentReportCard(
            @PathVariable Long studentId, @RequestParam String academicYear) {
        return reportService.generateStudentReportCard(studentId, academicYear);
    }

    @GetMapping(value = "/attendance", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public byte[] generateAttendanceReport(
            @RequestParam Long classId,
            @RequestParam Long sectionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.generateAttendanceReport(classId, sectionId, startDate, endDate);
    }

    @GetMapping(value = "/class/{classId}/report", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public byte[] generateClassReport(
            @PathVariable Long classId, @RequestParam String academicYear) {
        return reportService.generateClassReport(classId, academicYear);
    }
}
