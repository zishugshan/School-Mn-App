package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.GoalRequest;
import com.schoolmanagement.dto.request.GoalProgressRequest;
import com.schoolmanagement.dto.request.GoalSelfRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.GoalResponse;
import com.schoolmanagement.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<List<GoalResponse>> getAllGoals(
            @RequestParam(required = false) Long studentId) {
        List<GoalResponse> goals = goalService.getAllGoals(studentId);
        return ApiResponse.success(goals, "Goals retrieved successfully");
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<GoalResponse>> getStudentGoals(@PathVariable Long studentId) {
        List<GoalResponse> goals = goalService.getStudentGoals(studentId);
        return ApiResponse.success(goals, "Goals retrieved successfully");
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<GoalResponse>> getUserGoals(@PathVariable Long userId) {
        List<GoalResponse> goals = goalService.getUserGoals(userId);
        return ApiResponse.success(goals, "Goals retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<List<GoalResponse>> createGoal(@Valid @RequestBody GoalRequest request) {
        List<GoalResponse> goals = goalService.createGoal(request);
        return ApiResponse.success(goals, "Goal(s) created successfully");
    }

    @PostMapping("/self")
    public ApiResponse<GoalResponse> createSelfGoal(@Valid @RequestBody GoalSelfRequest request,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((com.schoolmanagement.security.CustomUserDetails) userDetails).getUserId();
        GoalResponse goal = goalService.createGoalForSelf(request, userId);
        return ApiResponse.success(goal, "Goal created successfully");
    }

    @PutMapping("/{id}/progress")
    public ApiResponse<GoalResponse> updateProgress(
            @PathVariable Long id, @Valid @RequestBody GoalProgressRequest request) {
        GoalResponse goal = goalService.updateProgress(id, request.getProgress());
        return ApiResponse.success(goal, "Progress updated successfully");
    }

    @PutMapping("/{id}/complete")
    public ApiResponse<GoalResponse> markComplete(@PathVariable Long id) {
        GoalResponse goal = goalService.markComplete(id);
        return ApiResponse.success(goal, "Goal marked as completed");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')")
    public ApiResponse<GoalResponse> updateGoal(
            @PathVariable Long id, @Valid @RequestBody GoalRequest request) {
        GoalResponse goal = goalService.updateGoal(id, request);
        return ApiResponse.success(goal, "Goal updated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ApiResponse.success(null, "Goal deleted successfully");
    }
}
