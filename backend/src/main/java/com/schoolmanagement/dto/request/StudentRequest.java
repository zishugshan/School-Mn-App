package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRequest {

    @NotNull
    private Long userId;

    @NotNull
    private LocalDate dateOfBirth;

    @NotBlank
    private String gender;

    private String address;
    private String city;
    private String state;
    private String pinCode;
    private Long houseId;
}
