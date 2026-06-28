package com.schoolmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentTransportRequest {

    @NotNull
    private Long studentId;

    @NotNull
    private Long routeId;

    private Long stopId;
    private String pickupTime;
    private String dropTime;
}
