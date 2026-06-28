package com.schoolmanagement.controller;

import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
public class UploadController {

    private final FileStorageService fileStorageService;

    @PostMapping
    public ApiResponse<Map<String, String>> uploadFile(@RequestParam MultipartFile file) {
        String fileUrl = fileStorageService.storeFile(file);
        return ApiResponse.success(Map.of("fileUrl", fileUrl), "File uploaded successfully");
    }

    @DeleteMapping("/{fileName}")
    public ApiResponse<Void> deleteFile(@PathVariable String fileName) {
        fileStorageService.deleteFile(fileName);
        return ApiResponse.success(null, "File deleted successfully");
    }
}
