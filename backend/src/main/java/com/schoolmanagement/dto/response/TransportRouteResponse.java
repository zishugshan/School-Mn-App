package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransportRouteResponse {

    private Long id;
    private String routeName;
    private String driverName;
    private String driverPhone;
    private String vehicleNumber;
    private List<TransportStopResponse> stops;
    private int studentCount;
    private boolean isActive;
}
