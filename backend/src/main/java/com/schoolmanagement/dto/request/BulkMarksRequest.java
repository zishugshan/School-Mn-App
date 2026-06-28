package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkMarksRequest {

    @NotNull
    private Long testId;

    private List<StudentMarksEntry> marks;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentMarksEntry {
        @NotNull
        private Long studentId;

        @NotNull
        private BigDecimal marksObtained;

        private String remarks;
    }
}
