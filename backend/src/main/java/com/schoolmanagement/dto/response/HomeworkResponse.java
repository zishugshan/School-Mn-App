package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeworkResponse {

    private Long id;
    private String title;
    private String description;
    private String subjectName;
    private Long teacherId;
    private String teacherName;
    private LocalDateTime dueDate;
    private BigDecimal maxScore;
    private String attachmentUrl;
    private boolean isBroadcast;
    private List<String> targetClasses;
    private List<Long> targetClassIds;
    private List<String> targetSectionNames;
    private List<Long> targetSectionIds;
    private LocalDateTime createdAt;
}
