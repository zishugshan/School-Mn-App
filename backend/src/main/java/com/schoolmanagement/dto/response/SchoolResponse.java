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
public class SchoolResponse {

    private Long id;
    private String name;
    private String domain;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String city;
    private String state;
    private String subscription;
    private Integer maxStudents;
    private boolean isActive;
    private LocalDateTime createdAt;
}
