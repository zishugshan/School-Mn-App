package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeRecordResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentCode;
    private Long feeTypeId;
    private String feeTypeName;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private BigDecimal balance;
    private LocalDate dueDate;
    private String status;
    private String paymentMethod;
    private LocalDate paymentDate;
    private String description;
    private LocalDateTime createdAt;
}
