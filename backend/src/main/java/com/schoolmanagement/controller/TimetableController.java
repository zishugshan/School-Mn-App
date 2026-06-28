package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.TimetableEntryRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.service.TimetableService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping("/class/{classId}/section/{sectionId}")
    public ApiResponse<List<Map<String, Object>>> getTimetable(
            @PathVariable Long classId, @PathVariable Long sectionId) {
        List<Map<String, Object>> timetable = timetableService.getTimetable(classId, sectionId);
        return ApiResponse.success(timetable, "Timetable retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<?> createEntry(@Valid @RequestBody TimetableEntryRequest request) {
        return ApiResponse.success(timetableService.createEntry(request), "Entry created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<?> updateEntry(
            @PathVariable Long id, @Valid @RequestBody TimetableEntryRequest request) {
        return ApiResponse.success(timetableService.updateEntry(id, request), "Entry updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> deleteEntry(@PathVariable Long id) {
        timetableService.deleteEntry(id);
        return ApiResponse.success(null, "Entry deleted successfully");
    }
}
