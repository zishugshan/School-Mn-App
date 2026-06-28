package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeTypeResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal amount;
    private String frequency;
    private boolean isActive;
}
