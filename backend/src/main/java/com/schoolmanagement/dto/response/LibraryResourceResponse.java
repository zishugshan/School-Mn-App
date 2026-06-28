package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryResourceResponse {

    private Long id;
    private String title;
    private String description;
    private String resourceType;
    private String url;
    private String category;
    private Long classId;
    private String className;
    private Long uploadedById;
    private String uploadedByRole;
    private String uploadedByName;
    private LocalDateTime createdAt;
}
