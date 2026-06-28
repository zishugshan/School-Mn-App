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
public class TestRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private Long subjectId;

    @NotNull
    private Long classId;

    private Long sectionId;

    @NotNull
    private Long teacherId;

    @NotNull
    private BigDecimal maximumMarks;

    private BigDecimal passingMarks;

    @NotNull
    private LocalDate testDate;

    private String examType;
}
