package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterParentRequest {

    @NotNull
    private Long userId;

    @NotBlank
    private String relationship;

    private String emergencyContact;
    private String occupation;
    private String address;
    private List<Long> studentIds;
}
