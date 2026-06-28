package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeworkDoubtResponse {

    private Long id;
    private Long homeworkId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String message;
    private Long parentDoubtId;
    private Boolean isResolved;
    private LocalDateTime createdAt;
    private List<HomeworkDoubtResponse> replies;
}
