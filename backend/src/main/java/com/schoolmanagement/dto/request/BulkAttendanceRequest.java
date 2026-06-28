package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkAttendanceRequest {

    @NotNull
    private Long classId;

    @NotNull
    private Long sectionId;

    @NotNull
    private LocalDate date;

    private List<StudentAttendanceEntry> students;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentAttendanceEntry {
        private Long studentId;
        private String status;
        private String remarks;
    }
}
