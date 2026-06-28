package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeworkSubmissionRequest {

    @NotNull
    private Long homeworkId;

    @NotNull
    private Long studentId;

    private String submissionText;
    private String attachmentUrl;
}
