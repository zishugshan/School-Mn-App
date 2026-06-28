package com.schoolmanagement.controller;

import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.ModuleResponse;
import com.schoolmanagement.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping
    public ApiResponse<ModuleResponse> getModuleStatus() {
        ModuleResponse moduleStatus = moduleService.getModuleStatus();
        return ApiResponse.success(moduleStatus, "Module status retrieved successfully");
    }
}
