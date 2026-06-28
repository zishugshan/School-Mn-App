package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRequest {

    @NotNull
    private Long studentId;

    @NotNull
    private Long classId;

    @NotNull
    private Long sectionId;

    @NotNull
    private LocalDate date;

    @NotNull
    private String status;

    private String remarks;
}
