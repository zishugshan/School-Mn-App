package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardResponse {

    private int rank;
    private Long studentId;
    private String studentCode;
    private String studentName;
    private String className;
    private String sectionName;
    private Double score;
    private String category;
    private String period;
}
