package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransportStopResponse {

    private Long id;
    private Long routeId;
    private String stopName;
    private String address;
    private String pickupTime;
    private String dropTime;
    private int stopOrder;
    private int studentCount;
}
