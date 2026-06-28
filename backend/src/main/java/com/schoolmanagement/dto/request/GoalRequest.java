package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class GoalRequest {

    private Long classId;

    private String studentCode;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private BigDecimal targetValue;

    private BigDecimal currentProgress;
    private String unit;
    private String category;
}
