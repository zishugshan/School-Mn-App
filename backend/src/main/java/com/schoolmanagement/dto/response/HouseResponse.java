package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseResponse {

    private Long id;
    private String name;
    private String color;
    private String motto;
    private int totalStudents;
    private int totalPoints;
    private String captainName;
    private String viceCaptainName;
}
