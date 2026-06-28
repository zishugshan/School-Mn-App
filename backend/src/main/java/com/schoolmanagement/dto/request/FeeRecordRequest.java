package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeRecordRequest {

    @NotNull
    private Long studentId;

    @NotNull
    private Long feeTypeId;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private LocalDate dueDate;

    private String description;
}
