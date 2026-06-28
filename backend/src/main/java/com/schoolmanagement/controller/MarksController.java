package com.schoolmanagement.controller;

import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.MarksResponse;
import com.schoolmanagement.service.MarksService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marks")
@RequiredArgsConstructor
public class MarksController {

    private final MarksService marksService;

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<MarksResponse>> getMarksByStudent(@PathVariable Long studentId) {
        List<MarksResponse> marks = marksService.getMarksByStudent(studentId);
        return ApiResponse.success(marks, "Marks retrieved successfully");
    }

    @GetMapping("/student/{studentId}/summary")
    public ApiResponse<Map<String, Object>> getMarksSummary(@PathVariable Long studentId) {
        Map<String, Object> summary = marksService.getMarksSummary(studentId);
        return ApiResponse.success(summary, "Marks summary retrieved successfully");
    }

    @GetMapping("/student/{studentId}/trend")
    public ApiResponse<List<Map<String, Object>>> getMarksTrend(@PathVariable Long studentId) {
        List<Map<String, Object>> trend = marksService.getMarksTrend(studentId);
        return ApiResponse.success(trend, "Marks trend retrieved successfully");
    }
}
