package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherResponse {

    private Long id;
    private Long userId;
    private String teacherCode;
    private String firstName;
    private String lastName;
    private String email;
    private String qualification;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String phone;
    private LocalDate dateJoined;
    private List<String> subjects;
    private String profilePhoto;
    private boolean isActive;
}
