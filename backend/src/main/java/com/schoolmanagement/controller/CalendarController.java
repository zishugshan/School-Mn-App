package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.CalendarEventRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.CalendarEventResponse;
import com.schoolmanagement.service.CalendarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public ApiResponse<List<CalendarEventResponse>> getCalendarEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<CalendarEventResponse> events = calendarService.getCalendarEvents(startDate, endDate);
        return ApiResponse.success(events, "Events retrieved successfully");
    }

    @GetMapping("/holidays")
    public ApiResponse<List<CalendarEventResponse>> getHolidays(@RequestParam int year) {
        List<CalendarEventResponse> holidays = calendarService.getHolidays(year);
        return ApiResponse.success(holidays, "Holidays retrieved successfully");
    }

    @GetMapping("/exams")
    public ApiResponse<List<CalendarEventResponse>> getExamDates(@RequestParam int year) {
        List<CalendarEventResponse> exams = calendarService.getExamDates(year);
        return ApiResponse.success(exams, "Exam dates retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<CalendarEventResponse> createEvent(@Valid @RequestBody CalendarEventRequest request) {
        CalendarEventResponse event = calendarService.createEvent(request);
        return ApiResponse.success(event, "Event created successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> deleteEvent(@PathVariable Long id) {
        calendarService.deleteEvent(id);
        return ApiResponse.success(null, "Event deleted successfully");
    }
}
