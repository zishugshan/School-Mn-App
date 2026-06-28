package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.FeeRecordRequest;
import com.schoolmanagement.dto.response.FeeRecordResponse;
import com.schoolmanagement.dto.response.FeeTypeResponse;
import com.schoolmanagement.entity.FeeRecord;
import com.schoolmanagement.entity.FeeType;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.enums.FeeStatus;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.FeeRecordRepository;
import com.schoolmanagement.repository.FeeTypeRepository;
import com.schoolmanagement.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FeeService {

    private final FeeRecordRepository feeRecordRepository;
    private final FeeTypeRepository feeTypeRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public List<FeeRecordResponse> getStudentFees(Long studentId) {
        return feeRecordRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public FeeRecordResponse createFeeRecord(FeeRecordRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));
        FeeType feeType = feeTypeRepository.findById(request.getFeeTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("FeeType", "id", request.getFeeTypeId()));

        FeeRecord feeRecord = FeeRecord.builder()
                .student(student)
                .feeType(feeType)
                .amount(request.getAmount())
                .paidAmount(BigDecimal.ZERO)
                .dueDate(request.getDueDate())
                .status(FeeStatus.UNPAID)
                .remarks(request.getDescription())
                .build();

        feeRecord = feeRecordRepository.save(feeRecord);
        return toResponse(feeRecord);
    }

    public FeeRecordResponse payFee(Long id, BigDecimal amount, String paymentMethod) {
        FeeRecord feeRecord = feeRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FeeRecord", "id", id));

        BigDecimal newPaid = feeRecord.getPaidAmount() != null
                ? feeRecord.getPaidAmount().add(amount)
                : amount;

        feeRecord.setPaidAmount(newPaid);
        feeRecord.setPaymentMethod(paymentMethod);
        feeRecord.setPaidDate(LocalDate.now());

        if (newPaid.compareTo(feeRecord.getAmount()) >= 0) {
            feeRecord.setStatus(FeeStatus.PAID);
        } else if (newPaid.compareTo(BigDecimal.ZERO) > 0) {
            feeRecord.setStatus(FeeStatus.PARTIAL);
        }

        feeRecord = feeRecordRepository.save(feeRecord);
        return toResponse(feeRecord);
    }

    @Transactional(readOnly = true)
    public List<FeeTypeResponse> getFeeTypes() {
        return feeTypeRepository.findByIsActiveTrue().stream()
                .map(this::toFeeTypeResponse)
                .collect(Collectors.toList());
    }

    private FeeRecordResponse toResponse(FeeRecord feeRecord) {
        BigDecimal balance = feeRecord.getAmount().subtract(
                feeRecord.getPaidAmount() != null ? feeRecord.getPaidAmount() : BigDecimal.ZERO);

        return FeeRecordResponse.builder()
                .id(feeRecord.getId())
                .studentId(feeRecord.getStudent().getId())
                .studentName(feeRecord.getStudent().getUser().getFirstName() + " " + feeRecord.getStudent().getUser().getLastName())
                .studentCode(feeRecord.getStudent().getStudentCode())
                .feeTypeId(feeRecord.getFeeType().getId())
                .feeTypeName(feeRecord.getFeeType().getName())
                .amount(feeRecord.getAmount())
                .paidAmount(feeRecord.getPaidAmount())
                .balance(balance)
                .dueDate(feeRecord.getDueDate())
                .status(feeRecord.getStatus().name())
                .paymentMethod(feeRecord.getPaymentMethod())
                .paymentDate(feeRecord.getPaidDate())
                .description(feeRecord.getRemarks())
                .createdAt(feeRecord.getCreatedAt())
                .build();
    }

    private FeeTypeResponse toFeeTypeResponse(FeeType feeType) {
        return FeeTypeResponse.builder()
                .id(feeType.getId())
                .name(feeType.getName())
                .description(feeType.getDescription())
                .amount(feeType.getAmount())
                .frequency(feeType.getFrequency())
                .isActive(feeType.getIsActive() != null && feeType.getIsActive())
                .build();
    }
}
