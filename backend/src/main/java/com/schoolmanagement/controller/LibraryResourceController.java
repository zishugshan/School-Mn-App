package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.LibraryResourceRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.LibraryResourceResponse;
import com.schoolmanagement.security.CustomUserDetails;
import com.schoolmanagement.service.LibraryResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
@RequestMapping("/api/library/resources")
@RequiredArgsConstructor
public class LibraryResourceController {

    private final LibraryResourceService service;

    @GetMapping
    public ApiResponse<List<LibraryResourceResponse>> getAllResources() {
        return ApiResponse.success(service.getAllResources(), "Resources retrieved successfully");
    }

    @GetMapping("/search")
    public ApiResponse<List<LibraryResourceResponse>> searchResources(@RequestParam String q) {
        return ApiResponse.success(service.searchResources(q), "Resources retrieved successfully");
    }

    @GetMapping("/category/{category}")
    public ApiResponse<List<LibraryResourceResponse>> getByCategory(@PathVariable String category) {
        return ApiResponse.success(service.getResourcesByCategory(category), "Resources retrieved successfully");
    }

    @GetMapping("/class/{classId}")
    public ApiResponse<List<LibraryResourceResponse>> getByClass(@PathVariable Long classId) {
        return ApiResponse.success(service.getResourcesByClass(classId), "Resources retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<LibraryResourceResponse> createResource(
            @Valid @RequestBody LibraryResourceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((CustomUserDetails) userDetails).getUserId();
        LibraryResourceResponse resource = service.createResource(request, userId);
        return ApiResponse.success(resource, "Resource created successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<Void> deleteResource(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        CustomUserDetails customUser = (CustomUserDetails) userDetails;
        service.deleteResource(id, customUser.getUserId(), customUser.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse(""));
        return ApiResponse.success(null, "Resource deleted successfully");
    }
}
