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
public class LibraryResourceRequest {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String resourceType;

    @NotBlank
    private String url;

    @NotBlank
    private String category;

    private Long classId;
}
