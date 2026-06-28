package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.CalendarEventRequest;
import com.schoolmanagement.dto.response.CalendarEventResponse;
import com.schoolmanagement.entity.CalendarEvent;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CalendarService {

    private final CalendarEventRepository calendarEventRepository;

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> getCalendarEvents(LocalDate startDate, LocalDate endDate) {
        return calendarEventRepository.findByEventDateBetween(startDate, endDate).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> getHolidays(int year) {
        return calendarEventRepository.findByIsHolidayTrue().stream()
                .filter(e -> e.getEventDate().getYear() == year)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> getExamDates(int year) {
        return calendarEventRepository.findByIsExamTrue().stream()
                .filter(e -> e.getEventDate().getYear() == year)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CalendarEventResponse createEvent(CalendarEventRequest request) {
        CalendarEvent event = CalendarEvent.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .eventDate(request.getStartDate())
                .endDate(request.getEndDate())
                .eventType(request.getEventType())
                .isHoliday("HOLIDAY".equalsIgnoreCase(request.getEventType()))
                .isExam("EXAM".equalsIgnoreCase(request.getEventType()))
                .build();

        event = calendarEventRepository.save(event);
        return toResponse(event);
    }

    public void deleteEvent(Long id) {
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CalendarEvent", "id", id));
        calendarEventRepository.delete(event);
    }

    private CalendarEventResponse toResponse(CalendarEvent event) {
        return CalendarEventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startDate(event.getEventDate())
                .endDate(event.getEndDate())
                .eventType(event.getEventType())
                .color(getColorForEventType(event.getEventType()))
                .build();
    }

    private String getColorForEventType(String eventType) {
        if (eventType == null) return "#3788d8";
        return switch (eventType.toUpperCase()) {
            case "HOLIDAY" -> "#e74c3c";
            case "EXAM" -> "#f39c12";
            case "EVENT" -> "#2ecc71";
            default -> "#3788d8";
        };
    }
}
