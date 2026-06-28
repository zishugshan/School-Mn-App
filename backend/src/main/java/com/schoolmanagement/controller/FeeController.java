package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.FeeRecordRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.FeeRecordResponse;
import com.schoolmanagement.dto.response.FeeTypeResponse;
import com.schoolmanagement.service.FeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService feeService;

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<FeeRecordResponse>> getStudentFees(@PathVariable Long studentId) {
        List<FeeRecordResponse> fees = feeService.getStudentFees(studentId);
        return ApiResponse.success(fees, "Fees retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<FeeRecordResponse> createFeeRecord(@Valid @RequestBody FeeRecordRequest request) {
        FeeRecordResponse response = feeService.createFeeRecord(request);
        return ApiResponse.success(response, "Fee record created successfully");
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<FeeRecordResponse> payFee(
            @PathVariable Long id,
            @RequestParam BigDecimal amount,
            @RequestParam String paymentMethod) {
        FeeRecordResponse response = feeService.payFee(id, amount, paymentMethod);
        return ApiResponse.success(response, "Fee paid successfully");
    }

    @GetMapping("/types")
    public ApiResponse<List<FeeTypeResponse>> getFeeTypes() {
        List<FeeTypeResponse> feeTypes = feeService.getFeeTypes();
        return ApiResponse.success(feeTypes, "Fee types retrieved successfully");
    }
}
