package com.schoolmanagement.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateParentRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String occupation;
    private String address;
    private String relationship;
    private List<Long> studentIds;
}
