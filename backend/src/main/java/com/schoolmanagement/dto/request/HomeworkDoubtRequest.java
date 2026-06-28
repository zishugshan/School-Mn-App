package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeworkDoubtRequest {

    @NotNull
    private Long senderId;

    @NotBlank
    private String message;

    private Long parentDoubtId;
}
