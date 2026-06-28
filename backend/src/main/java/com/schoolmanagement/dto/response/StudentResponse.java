package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponse {

    private Long id;
    private Long userId;
    private String studentCode;
    private String firstName;
    private String lastName;
    private String email;
    private LocalDate dateOfBirth;
    private String gender;
    private LocalDate admissionDate;
    private String address;
    private String city;
    private String state;
    private String pinCode;
    private String houseName;
    private String houseColor;
    private String className;
    private String sectionName;
    private Long classId;
    private Long sectionId;
    private Long houseId;
    private Integer totalPoints;
    private String profilePhoto;
    private boolean isActive;
}
