package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class GoalSelfRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private BigDecimal targetValue;

    private BigDecimal currentProgress;
    private String unit;
    private String category;
    private LocalDate targetDate;
}
