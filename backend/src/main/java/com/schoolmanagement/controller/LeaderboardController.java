package com.schoolmanagement.controller;

import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.LeaderboardResponse;
import com.schoolmanagement.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboards")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ApiResponse<List<LeaderboardResponse>> getLeaderboard(
            @RequestParam String category,
            @RequestParam String period,
            @RequestParam int year,
            @RequestParam(required = false) Integer month) {
        List<LeaderboardResponse> leaderboard = leaderboardService.getLeaderboard(category, period, year, month);
        return ApiResponse.success(leaderboard, "Leaderboard retrieved successfully");
    }

    @GetMapping("/class/{classId}")
    public ApiResponse<List<LeaderboardResponse>> getClassLeaderboard(
            @PathVariable Long classId,
            @RequestParam String category,
            @RequestParam String period,
            @RequestParam int year,
            @RequestParam(required = false) Integer month) {
        List<LeaderboardResponse> leaderboard =
                leaderboardService.getClassLeaderboard(classId, category, period, year, month);
        return ApiResponse.success(leaderboard, "Class leaderboard retrieved successfully");
    }

    @GetMapping("/top")
    public ApiResponse<List<LeaderboardResponse>> getTop10(
            @RequestParam String category,
            @RequestParam String period,
            @RequestParam int year,
            @RequestParam(required = false) Integer month) {
        List<LeaderboardResponse> top = leaderboardService.getTop10(category, period, year, month);
        return ApiResponse.success(top, "Top 10 retrieved successfully");
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<LeaderboardResponse>> getStudentLeaderboardEntries(
            @PathVariable Long studentId) {
        List<LeaderboardResponse> entries = leaderboardService.getStudentLeaderboardEntries(studentId);
        return ApiResponse.success(entries, "Leaderboard entries retrieved successfully");
    }
}
