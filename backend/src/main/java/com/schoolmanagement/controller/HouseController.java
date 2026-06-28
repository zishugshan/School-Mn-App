package com.schoolmanagement.controller;

import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.HouseResponse;
import com.schoolmanagement.service.HouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/houses")
@RequiredArgsConstructor
public class HouseController {

    private final HouseService houseService;

    @GetMapping
    public ApiResponse<List<HouseResponse>> getAllHouses() {
        List<HouseResponse> houses = houseService.getAllHouses();
        return ApiResponse.success(houses, "Houses retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<HouseResponse> getHouseById(@PathVariable Long id) {
        HouseResponse house = houseService.getHouseById(id);
        return ApiResponse.success(house, "House retrieved successfully");
    }

    @GetMapping("/{id}/leaderboard")
    public ApiResponse<List<Map<String, Object>>> getHouseLeaderboard(@PathVariable Long id) {
        List<Map<String, Object>> leaderboard = houseService.getHouseLeaderboard(id);
        return ApiResponse.success(leaderboard, "House leaderboard retrieved successfully");
    }

    @GetMapping("/leaderboard")
    public ApiResponse<List<Map<String, Object>>> getAllHousesLeaderboard() {
        List<Map<String, Object>> leaderboard = houseService.getAllHousesLeaderboard();
        return ApiResponse.success(leaderboard, "All houses leaderboard retrieved successfully");
    }
}
