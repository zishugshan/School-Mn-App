package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RemarkResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentCode;
    private Long teacherId;
    private String teacherName;
    private Long subjectId;
    private String subjectName;
    private String remark;
    private String category;
    private Boolean isPositive;
    private LocalDateTime createdAt;
}
