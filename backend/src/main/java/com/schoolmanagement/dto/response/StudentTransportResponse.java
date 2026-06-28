package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentTransportResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentCode;
    private Long routeId;
    private String routeName;
    private String vehicleNumber;
    private String driverName;
    private String driverPhone;
    private String stopName;
    private String pickupTime;
    private String dropTime;
}
