package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String author;

    private String isbn;
    private String publisher;
    private Integer quantity;
    private String category;
}
