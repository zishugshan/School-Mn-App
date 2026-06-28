package com.schoolmanagement.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTeacherRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String qualification;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String phone;
}
