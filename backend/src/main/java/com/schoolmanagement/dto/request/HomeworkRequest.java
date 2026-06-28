package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class HomeworkRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private Long subjectId;

    @NotNull
    private Long teacherId;

    @NotNull
    private LocalDateTime dueDate;

    private BigDecimal maxScore;
    private String attachmentUrl;
    private Boolean isBroadcast;
    private String broadcastLevel;

    private List<HomeworkTargetEntry> targets;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HomeworkTargetEntry {
        private Long classId;
        private Long sectionId;
        private Long studentId;
    }
}
