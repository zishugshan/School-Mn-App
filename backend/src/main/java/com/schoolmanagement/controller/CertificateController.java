package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.CertificateRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.CertificateResponse;
import com.schoolmanagement.service.CertificateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<CertificateResponse>> getStudentCertificates(@PathVariable Long studentId) {
        List<CertificateResponse> certificates = certificateService.getStudentCertificates(studentId);
        return ApiResponse.success(certificates, "Certificates retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<CertificateResponse> issueCertificate(@Valid @RequestBody CertificateRequest request) {
        CertificateResponse certificate = certificateService.issueCertificate(request);
        return ApiResponse.success(certificate, "Certificate issued successfully");
    }

    @GetMapping(value = "/{id}/download", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public byte[] downloadCertificate(@PathVariable Long id) {
        return certificateService.downloadCertificate(id);
    }
}
