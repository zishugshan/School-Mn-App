package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherDashboardResponse {

    private TeacherResponse teacher;
    private int classesHandled;
    private int homeworkAssigned;
    private int attendanceSubmitted;
    private int testsConducted;
    private Map<String, Object> studentPerformanceAnalytics;
}
