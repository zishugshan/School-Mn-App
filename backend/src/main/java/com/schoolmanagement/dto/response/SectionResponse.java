package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionResponse {

    private Long id;
    private Long classId;
    private String className;
    private String name;
    private String code;
    private String roomNumber;
    private Integer capacity;
    private Boolean isActive;
}
