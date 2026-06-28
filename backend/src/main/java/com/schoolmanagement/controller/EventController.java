package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.EventRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.EventResponse;
import com.schoolmanagement.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ApiResponse<List<EventResponse>> getAllEvents() {
        List<EventResponse> events = eventService.getAllEvents();
        return ApiResponse.success(events, "Events retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<EventResponse> getEventById(@PathVariable Long id) {
        EventResponse event = eventService.getEventById(id);
        return ApiResponse.success(event, "Event retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        EventResponse event = eventService.createEvent(request);
        return ApiResponse.success(event, "Event created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<EventResponse> updateEvent(
            @PathVariable Long id, @Valid @RequestBody EventRequest request) {
        EventResponse event = eventService.updateEvent(id, request);
        return ApiResponse.success(event, "Event updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ApiResponse.success(null, "Event deleted successfully");
    }

    @PostMapping("/{eventId}/participants/{studentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<Void> addParticipant(
            @PathVariable Long eventId, @PathVariable Long studentId) {
        eventService.addParticipant(eventId, studentId);
        return ApiResponse.success(null, "Participant added successfully");
    }

    @DeleteMapping("/{eventId}/participants/{studentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN') or hasRole('TEACHER')")
    public ApiResponse<Void> removeParticipant(
            @PathVariable Long eventId, @PathVariable Long studentId) {
        eventService.removeParticipant(eventId, studentId);
        return ApiResponse.success(null, "Participant removed successfully");
    }
}
