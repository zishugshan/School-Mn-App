package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.StudentTransportRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.StudentTransportResponse;
import com.schoolmanagement.dto.response.TransportRouteResponse;
import com.schoolmanagement.dto.response.TransportStopResponse;
import com.schoolmanagement.service.TransportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
@RequiredArgsConstructor
public class TransportController {

    private final TransportService transportService;

    @GetMapping("/routes")
    public ApiResponse<List<TransportRouteResponse>> getAllRoutes() {
        List<TransportRouteResponse> routes = transportService.getAllRoutes();
        return ApiResponse.success(routes, "Routes retrieved successfully");
    }

    @GetMapping("/routes/{routeId}/stops")
    public ApiResponse<List<TransportStopResponse>> getRouteStops(@PathVariable Long routeId) {
        List<TransportStopResponse> stops = transportService.getRouteStops(routeId);
        return ApiResponse.success(stops, "Stops retrieved successfully");
    }

    @PostMapping("/routes")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<TransportRouteResponse> createRoute(@Valid @RequestBody TransportRouteResponse request) {
        TransportRouteResponse route = transportService.createRoute(request);
        return ApiResponse.success(route, "Route created successfully");
    }

    @PostMapping("/routes/{routeId}/stops")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<TransportStopResponse> addStop(
            @PathVariable Long routeId, @Valid @RequestBody TransportStopResponse request) {
        TransportStopResponse stop = transportService.addStop(routeId, request);
        return ApiResponse.success(stop, "Stop added successfully");
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<StudentTransportResponse> assignStudentRoute(
            @Valid @RequestBody StudentTransportRequest request) {
        StudentTransportResponse response = transportService.assignStudentRoute(request);
        return ApiResponse.success(response, "Route assigned successfully");
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<StudentTransportResponse> getStudentTransport(@PathVariable Long studentId) {
        StudentTransportResponse transport = transportService.getStudentTransport(studentId);
        return ApiResponse.success(transport, "Transport details retrieved successfully");
    }
}
