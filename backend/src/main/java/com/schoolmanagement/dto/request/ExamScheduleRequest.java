package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamScheduleRequest {

    @NotBlank
    private String title;

    @NotNull
    private Long classId;

    private Long sectionId;

    @NotNull
    private Long subjectId;

    @NotBlank
    private String examType;

    @NotBlank
    private String date;

    @NotBlank
    private String startTime;

    @NotBlank
    private String endTime;

    private String room;
}
