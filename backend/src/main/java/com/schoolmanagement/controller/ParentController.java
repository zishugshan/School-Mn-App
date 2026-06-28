package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.RegisterParentRequest;
import com.schoolmanagement.dto.request.UpdateParentRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.StudentResponse;
import com.schoolmanagement.entity.Parent;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.service.ParentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/parents")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<List<Map<String, Object>>> getAllParents() {
        List<Parent> parents = parentService.getAllParents();
        List<Map<String, Object>> result = parents.stream()
                .map(this::toParentMap)
                .collect(java.util.stream.Collectors.toList());
        return ApiResponse.success(result, "Parents retrieved successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<Map<String, Object>> updateParent(
            @PathVariable Long id, @Valid @RequestBody UpdateParentRequest request) {
        Parent p = parentService.updateParent(id, request);
        return ApiResponse.success(toParentMap(p), "Parent updated successfully");
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<List<Map<String, Object>>> getParentsByStudentId(@PathVariable Long studentId) {
        List<Parent> parents = parentService.getParentsByStudentId(studentId);
        List<Map<String, Object>> result = parents.stream()
                .map(this::toParentMap)
                .collect(java.util.stream.Collectors.toList());
        return ApiResponse.success(result, "Parents retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getParentById(@PathVariable Long id) {
        Parent p = parentService.getParentById(id);
        return ApiResponse.success(toParentMap(p), "Parent retrieved successfully");
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<Map<String, Object>> getParentByUserId(@PathVariable Long userId) {
        Parent p = parentService.getParentByUserId(userId);
        return ApiResponse.success(toParentMap(p), "Parent retrieved successfully");
    }

    @GetMapping("/{id}/students")
    public ApiResponse<List<StudentResponse>> getStudentsByParentId(@PathVariable Long id) {
        List<StudentResponse> students = parentService.getStudentsByParentId(id);
        return ApiResponse.success(students, "Students retrieved successfully");
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> registerParent(@Valid @RequestBody RegisterParentRequest request) {
        Parent p = parentService.registerParent(request);
        return ApiResponse.success(toParentMap(p), "Parent registered successfully");
    }

    @PostMapping("/with-user")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<Map<String, Object>> createParentWithUser(@Valid @RequestBody UpdateParentRequest request) {
        Parent p = parentService.createParentWithUser(request);
        return ApiResponse.success(toParentMap(p), "Parent created successfully");
    }

    @PostMapping("/{parentId}/students/{studentId}")
    public ApiResponse<Void> linkStudent(
            @PathVariable Long parentId, @PathVariable Long studentId) {
        parentService.linkStudent(parentId, studentId);
        return ApiResponse.success(null, "Student linked successfully");
    }

    private Map<String, Object> toParentMap(Parent p) {
        Map<String, Object> m = new java.util.HashMap<>();
        m.put("id", p.getId());
        m.put("occupation", p.getOccupation() != null ? p.getOccupation() : "");
        // User lazy-load should work via OSIV
        if (p.getUser() != null) {
            m.put("parentName", p.getUser().getFirstName() + " " + p.getUser().getLastName());
            m.put("email", p.getUser().getEmail());
            m.put("phone", p.getUser().getPhone() != null ? p.getUser().getPhone() : "");
            m.put("userId", p.getUser().getId());
        } else {
            m.put("email", "");
            m.put("phone", "");
            m.put("parentName", "");
        }
        m.put("relationship", p.getRelationship() != null ? p.getRelationship() : "");
        m.put("address", p.getAddress() != null ? p.getAddress() : "");
        m.put("status", "active");
        List<Long> studentIds = p.getStudents() != null
                ? p.getStudents().stream().map(Student::getId).collect(java.util.stream.Collectors.toList())
                : java.util.Collections.emptyList();
        m.put("studentIds", studentIds);
        m.put("children", studentIds.size());
        m.put("childNames", p.getStudents() != null
                ? p.getStudents().stream()
                        .map(s -> {
                            User u = s.getUser();
                            return u != null ? u.getFirstName() + " " + u.getLastName() : "Student #" + s.getId();
                        })
                        .collect(java.util.stream.Collectors.toList())
                : java.util.Collections.emptyList());
        return m;
    }
}
