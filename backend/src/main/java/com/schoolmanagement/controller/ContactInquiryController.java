package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.ContactInquiryRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.ContactInquiryResponse;
import com.schoolmanagement.service.ContactInquiryService;
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

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactInquiryController {

    private final ContactInquiryService contactInquiryService;

    @PostMapping
    public ApiResponse<ContactInquiryResponse> submitInquiry(@Valid @RequestBody ContactInquiryRequest request) {
        ContactInquiryResponse response = contactInquiryService.createInquiry(request);
        return ApiResponse.success(response, "Inquiry submitted successfully");
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<ContactInquiryResponse>> getAllInquiries() {
        return ApiResponse.success(contactInquiryService.getAllInquiries(), "Inquiries retrieved successfully");
    }

    @GetMapping("/unread")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<ContactInquiryResponse>> getUnreadInquiries() {
        return ApiResponse.success(contactInquiryService.getUnreadInquiries(), "Unread inquiries retrieved successfully");
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<ContactInquiryResponse> markAsRead(@PathVariable Long id) {
        return ApiResponse.success(contactInquiryService.markAsRead(id), "Inquiry marked as read");
    }
}
