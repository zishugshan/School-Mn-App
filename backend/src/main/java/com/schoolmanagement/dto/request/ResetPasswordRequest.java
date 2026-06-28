package com.schoolmanagement.dto.request;

public record ResetPasswordRequest(String token, String newPassword) {
}
