package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolRequest {

    @NotBlank
    private String name;

    private String domain;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String city;
    private String state;
    private String subscription;
    private Integer maxStudents;
}
