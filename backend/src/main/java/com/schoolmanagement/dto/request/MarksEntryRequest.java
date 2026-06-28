package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarksEntryRequest {

    @NotNull
    private Long testId;

    @NotNull
    private Long studentId;

    @NotNull
    private BigDecimal marksObtained;

    private String remarks;
}
