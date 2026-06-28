package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassResponse {

    private Long id;
    private String name;
    private String description;
    private String sectionPrefix;
    private List<SectionResponse> sections;
    private List<String> subjects;
    private String classTeacherName;
    private boolean isActive;
}
