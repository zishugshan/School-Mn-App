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
public class RemarkRequest {

    @NotNull
    private Long studentId;

    @NotNull
    private Long teacherId;

    @NotBlank
    private String remark;

    private String category;
}
