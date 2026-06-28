package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.StudentTransportRequest;
import com.schoolmanagement.dto.response.StudentTransportResponse;
import com.schoolmanagement.dto.response.TransportRouteResponse;
import com.schoolmanagement.dto.response.TransportStopResponse;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.StudentTransport;
import com.schoolmanagement.entity.TransportRoute;
import com.schoolmanagement.entity.TransportStop;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.StudentTransportRepository;
import com.schoolmanagement.repository.TransportRouteRepository;
import com.schoolmanagement.repository.TransportStopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TransportService {

    private final TransportRouteRepository transportRouteRepository;
    private final TransportStopRepository transportStopRepository;
    private final StudentTransportRepository studentTransportRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public List<TransportRouteResponse> getAllRoutes() {
        return transportRouteRepository.findByIsActiveTrue().stream()
                .map(this::toRouteResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransportStopResponse> getRouteStops(Long routeId) {
        TransportRoute route = transportRouteRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("TransportRoute", "id", routeId));
        return transportStopRepository.findByRouteIdOrderByStopOrderAsc(routeId).stream()
                .map(this::toStopResponse)
                .collect(Collectors.toList());
    }

    public TransportRouteResponse createRoute(TransportRouteResponse request) {
        TransportRoute route = TransportRoute.builder()
                .name(request.getRouteName())
                .vehicleNumber(request.getVehicleNumber())
                .driverName(request.getDriverName())
                .driverPhone(request.getDriverPhone())
                .isActive(true)
                .build();

        route = transportRouteRepository.save(route);
        return toRouteResponse(route);
    }

    public TransportStopResponse addStop(Long routeId, TransportStopResponse request) {
        TransportRoute route = transportRouteRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("TransportRoute", "id", routeId));

        TransportStop stop = TransportStop.builder()
                .route(route)
                .name(request.getStopName())
                .address(request.getAddress())
                .stopOrder(request.getStopOrder())
                .pickupTime(request.getPickupTime() != null ? LocalTime.parse(request.getPickupTime()) : null)
                .dropTime(request.getDropTime() != null ? LocalTime.parse(request.getDropTime()) : null)
                .build();

        stop = transportStopRepository.save(stop);
        return toStopResponse(stop);
    }

    public StudentTransportResponse assignStudentRoute(StudentTransportRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));
        TransportRoute route = transportRouteRepository.findById(request.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("TransportRoute", "id", request.getRouteId()));

        TransportStop stop = null;
        if (request.getStopId() != null) {
            stop = transportStopRepository.findById(request.getStopId())
                    .orElseThrow(() -> new ResourceNotFoundException("TransportStop", "id", request.getStopId()));
        }

        StudentTransport existing = studentTransportRepository.findByStudentId(request.getStudentId())
                .orElse(null);

        StudentTransport studentTransport;
        if (existing != null) {
            existing.setRoute(route);
            existing.setStop(stop);
            studentTransport = studentTransportRepository.save(existing);
        } else {
            studentTransport = StudentTransport.builder()
                    .student(student)
                    .route(route)
                    .stop(stop)
                    .isActive(true)
                    .build();
            studentTransport = studentTransportRepository.save(studentTransport);
        }

        return toStudentTransportResponse(studentTransport);
    }

    @Transactional(readOnly = true)
    public StudentTransportResponse getStudentTransport(Long studentId) {
        StudentTransport studentTransport = studentTransportRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentTransport", "studentId", studentId));
        return toStudentTransportResponse(studentTransport);
    }

    private TransportRouteResponse toRouteResponse(TransportRoute route) {
        List<TransportStop> stops = transportStopRepository.findByRouteIdOrderByStopOrderAsc(route.getId());
        long studentCount = studentTransportRepository.findByRouteId(route.getId()).size();

        return TransportRouteResponse.builder()
                .id(route.getId())
                .routeName(route.getName())
                .driverName(route.getDriverName())
                .driverPhone(route.getDriverPhone())
                .vehicleNumber(route.getVehicleNumber())
                .stops(stops.stream().map(this::toStopResponse).collect(Collectors.toList()))
                .studentCount((int) studentCount)
                .isActive(route.getIsActive() != null && route.getIsActive())
                .build();
    }

    private TransportStopResponse toStopResponse(TransportStop stop) {
        long studentCount = studentTransportRepository.findByRouteId(stop.getRoute().getId()).stream()
                .filter(st -> st.getStop() != null && st.getStop().getId().equals(stop.getId()))
                .count();

        return TransportStopResponse.builder()
                .id(stop.getId())
                .routeId(stop.getRoute().getId())
                .stopName(stop.getName())
                .address(stop.getAddress())
                .pickupTime(stop.getPickupTime() != null ? stop.getPickupTime().toString() : null)
                .dropTime(stop.getDropTime() != null ? stop.getDropTime().toString() : null)
                .stopOrder(stop.getStopOrder())
                .studentCount((int) studentCount)
                .build();
    }

    private StudentTransportResponse toStudentTransportResponse(StudentTransport st) {
        return StudentTransportResponse.builder()
                .id(st.getId())
                .studentId(st.getStudent().getId())
                .studentName(st.getStudent().getUser().getFirstName() + " " + st.getStudent().getUser().getLastName())
                .studentCode(st.getStudent().getStudentCode())
                .routeId(st.getRoute().getId())
                .routeName(st.getRoute().getName())
                .vehicleNumber(st.getRoute().getVehicleNumber())
                .driverName(st.getRoute().getDriverName())
                .driverPhone(st.getRoute().getDriverPhone())
                .stopName(st.getStop() != null ? st.getStop().getName() : null)
                .pickupTime(st.getStop() != null && st.getStop().getPickupTime() != null
                        ? st.getStop().getPickupTime().toString() : null)
                .dropTime(st.getStop() != null && st.getStop().getDropTime() != null
                        ? st.getStop().getDropTime().toString() : null)
                .build();
    }
}
