package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamScheduleResponse {

    private Long id;
    private String title;
    private String examType;
    private String subjectName;
    private String className;
    private String sectionName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
}
