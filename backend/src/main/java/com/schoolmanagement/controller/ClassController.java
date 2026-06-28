package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.ClassRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.ClassResponse;
import com.schoolmanagement.service.ClassService;
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

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @GetMapping
    public ApiResponse<List<ClassResponse>> getAllClasses() {
        List<ClassResponse> classes = classService.getAllClasses();
        return ApiResponse.success(classes, "Classes retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<ClassResponse> getClassById(@PathVariable Long id) {
        ClassResponse classResponse = classService.getClassById(id);
        return ApiResponse.success(classResponse, "Class retrieved successfully");
    }

    @GetMapping("/{id}/sections")
    public ApiResponse<?> getSectionsByClassId(@PathVariable Long id) {
        return ApiResponse.success(classService.getSectionsByClassId(id), "Sections retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<ClassResponse> createClass(@Valid @RequestBody ClassRequest request) {
        ClassResponse classResponse = classService.createClass(request);
        return ApiResponse.success(classResponse, "Class created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<ClassResponse> updateClass(
            @PathVariable Long id, @Valid @RequestBody ClassRequest request) {
        ClassResponse classResponse = classService.updateClass(id, request);
        return ApiResponse.success(classResponse, "Class updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> deleteClass(@PathVariable Long id) {
        classService.deleteClass(id);
        return ApiResponse.success(null, "Class deleted successfully");
    }

    @PostMapping("/{classId}/sections/{sectionId}/teachers/{teacherId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> assignTeacher(
            @PathVariable Long classId,
            @PathVariable Long sectionId,
            @PathVariable Long teacherId,
            @RequestParam(defaultValue = "false") boolean isClassTeacher) {
        classService.assignTeacher(classId, sectionId, teacherId, isClassTeacher);
        return ApiResponse.success(null, "Teacher assigned successfully");
    }

    @PostMapping("/{classId}/subjects/{subjectId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> assignSubject(
            @PathVariable Long classId, @PathVariable Long subjectId) {
        classService.assignSubject(classId, subjectId);
        return ApiResponse.success(null, "Subject assigned successfully");
    }

    @DeleteMapping("/{classId}/subjects/{subjectId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> removeSubject(
            @PathVariable Long classId, @PathVariable Long subjectId) {
        classService.removeSubject(classId, subjectId);
        return ApiResponse.success(null, "Subject removed successfully");
    }
}
