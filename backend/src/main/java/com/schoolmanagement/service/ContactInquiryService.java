package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.ContactInquiryRequest;
import com.schoolmanagement.dto.response.ContactInquiryResponse;
import com.schoolmanagement.entity.ContactInquiry;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.ContactInquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ContactInquiryService {

    private final ContactInquiryRepository contactInquiryRepository;

    public ContactInquiryResponse createInquiry(ContactInquiryRequest request) {
        ContactInquiry inquiry = ContactInquiry.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .schoolName(request.getSchoolName())
                .message(request.getMessage())
                .isRead(false)
                .build();
        return toResponse(contactInquiryRepository.save(inquiry));
    }

    @Transactional(readOnly = true)
    public List<ContactInquiryResponse> getAllInquiries() {
        return contactInquiryRepository.findByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContactInquiryResponse> getUnreadInquiries() {
        return contactInquiryRepository.findByIsReadFalseOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ContactInquiryResponse markAsRead(Long id) {
        ContactInquiry inquiry = contactInquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ContactInquiry", "id", id));
        inquiry.setIsRead(true);
        return toResponse(contactInquiryRepository.save(inquiry));
    }

    private ContactInquiryResponse toResponse(ContactInquiry inquiry) {
        return ContactInquiryResponse.builder()
                .id(inquiry.getId())
                .name(inquiry.getName())
                .email(inquiry.getEmail())
                .phone(inquiry.getPhone())
                .schoolName(inquiry.getSchoolName())
                .message(inquiry.getMessage())
                .isRead(inquiry.getIsRead() != null && inquiry.getIsRead())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}
