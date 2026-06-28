package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.ChangePasswordRequest;
import com.schoolmanagement.dto.request.UpdateProfileRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.UserProfileResponse;
import com.schoolmanagement.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getCurrentUserProfile() {
        UserProfileResponse profile = profileService.getCurrentUserProfile();
        return ApiResponse.success(profile, "Profile retrieved successfully");
    }

    @PutMapping("/me")
    public ApiResponse<UserProfileResponse> updateCurrentUserProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse profile = profileService.updateCurrentUserProfile(request);
        return ApiResponse.success(profile, "Profile updated successfully");
    }

    @PutMapping("/me/password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(request);
        return ApiResponse.success(null, "Password changed successfully");
    }

    @PostMapping("/me/photo")
    public ApiResponse<UserProfileResponse> uploadProfilePhoto(@RequestParam MultipartFile file) {
        UserProfileResponse profile = profileService.uploadProfilePhoto(file);
        return ApiResponse.success(profile, "Profile photo updated successfully");
    }
}
