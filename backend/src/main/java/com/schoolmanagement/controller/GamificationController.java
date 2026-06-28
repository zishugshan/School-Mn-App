package com.schoolmanagement.controller;

import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.GamificationResponse;
import com.schoolmanagement.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    @GetMapping("/students/{studentId}/badges")
    public ApiResponse<List<GamificationResponse.BadgeResponse>> getStudentBadges(
            @PathVariable Long studentId) {
        List<GamificationResponse.BadgeResponse> badges = gamificationService.getStudentBadges(studentId);
        return ApiResponse.success(badges, "Badges retrieved successfully");
    }

    @GetMapping("/students/{studentId}/achievements")
    public ApiResponse<List<GamificationResponse.AchievementResponse>> getStudentAchievements(
            @PathVariable Long studentId) {
        List<GamificationResponse.AchievementResponse> achievements =
                gamificationService.getStudentAchievements(studentId);
        return ApiResponse.success(achievements, "Achievements retrieved successfully");
    }

    @GetMapping("/students/{studentId}/points")
    public ApiResponse<Integer> getStudentPoints(@PathVariable Long studentId) {
        Integer points = gamificationService.getStudentPoints(studentId);
        return ApiResponse.success(points, "Points retrieved successfully");
    }

    @GetMapping("/students/{studentId}/streaks")
    public ApiResponse<List<GamificationResponse.StreakResponse>> getStudentStreaks(
            @PathVariable Long studentId) {
        List<GamificationResponse.StreakResponse> streaks = gamificationService.getStudentStreaks(studentId);
        return ApiResponse.success(streaks, "Streaks retrieved successfully");
    }

    @GetMapping("/leaderboard")
    public ApiResponse<List<Map<String, Object>>> getGamificationLeaderboard() {
        List<Map<String, Object>> leaderboard = gamificationService.getGamificationLeaderboard();
        return ApiResponse.success(leaderboard, "Leaderboard retrieved successfully");
    }
}
