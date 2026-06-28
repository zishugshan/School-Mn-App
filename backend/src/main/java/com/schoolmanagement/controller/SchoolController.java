package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.SchoolRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.SchoolResponse;
import com.schoolmanagement.service.SchoolService;
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
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<SchoolResponse>> getAllSchools() {
        return ApiResponse.success(schoolService.getAllSchools(), "Schools retrieved successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<SchoolResponse> getSchoolById(@PathVariable Long id) {
        return ApiResponse.success(schoolService.getSchoolById(id), "School retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<SchoolResponse> createSchool(@Valid @RequestBody SchoolRequest request) {
        return ApiResponse.success(schoolService.createSchool(request), "School created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<SchoolResponse> updateSchool(@PathVariable Long id, @Valid @RequestBody SchoolRequest request) {
        return ApiResponse.success(schoolService.updateSchool(id, request), "School updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> deleteSchool(@PathVariable Long id) {
        schoolService.deleteSchool(id);
        return ApiResponse.success(null, "School deleted successfully");
    }
}
