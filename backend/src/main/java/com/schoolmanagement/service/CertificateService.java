package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.CertificateRequest;
import com.schoolmanagement.dto.response.CertificateResponse;
import com.schoolmanagement.entity.Certificate;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.CertificateRepository;
import com.schoolmanagement.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public List<CertificateResponse> getStudentCertificates(Long studentId) {
        return certificateRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CertificateResponse issueCertificate(CertificateRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));

        Certificate certificate = Certificate.builder()
                .student(student)
                .title(request.getCertificateType())
                .description(request.getDescription())
                .certificateType(request.getCertificateType())
                .issuedDate(LocalDate.now())
                .certificateUrl(null)
                .build();

        certificate = certificateRepository.save(certificate);
        return toResponse(certificate);
    }

    @Transactional(readOnly = true)
    public byte[] downloadCertificate(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate", "id", id));

        // Generate a simple PDF-like byte array (placeholder - in production use iText or similar)
        String content = String.format(
                "CERTIFICATE OF %s\n\nStudent: %s %s\nDate: %s\nDescription: %s",
                certificate.getCertificateType(),
                certificate.getStudent().getUser().getFirstName(),
                certificate.getStudent().getUser().getLastName(),
                certificate.getIssuedDate(),
                certificate.getDescription() != null ? certificate.getDescription() : ""
        );

        return content.getBytes();
    }

    private CertificateResponse toResponse(Certificate certificate) {
        return CertificateResponse.builder()
                .id(certificate.getId())
                .studentId(certificate.getStudent().getId())
                .studentName(certificate.getStudent().getUser().getFirstName() + " " + certificate.getStudent().getUser().getLastName())
                .studentCode(certificate.getStudent().getStudentCode())
                .certificateType(certificate.getCertificateType())
                .description(certificate.getDescription())
                .issuedBy(null)
                .academicYear(null)
                .issueDate(certificate.getIssuedDate())
                .createdAt(certificate.getCreatedAt())
                .build();
    }
}
