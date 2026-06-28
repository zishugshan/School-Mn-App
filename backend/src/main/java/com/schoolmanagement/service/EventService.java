package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.EventRequest;
import com.schoolmanagement.dto.response.EventResponse;
import com.schoolmanagement.entity.Event;
import com.schoolmanagement.entity.EventParticipant;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.enums.EventType;
import com.schoolmanagement.exception.BadRequestException;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.EventParticipantRepository;
import com.schoolmanagement.repository.EventRepository;
import com.schoolmanagement.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        return toResponse(event);
    }

    public EventResponse createEvent(EventRequest request) {
        EventType eventType;
        try {
            eventType = EventType.valueOf(request.getEventType().toUpperCase());
        } catch (IllegalArgumentException e) {
            eventType = EventType.OTHER;
        }

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .eventType(eventType)
                .startDate(request.getEventDate().atStartOfDay())
                .endDate(request.getEventDate().atTime(23, 59))
                .location(request.getVenue())
                .isActive(true)
                .build();

        event = eventRepository.save(event);
        return toResponse(event);
    }

    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getEventDate().atStartOfDay());
        event.setEndDate(request.getEventDate().atTime(23, 59));
        event.setLocation(request.getVenue());

        if (request.getEventType() != null) {
            try {
                event.setEventType(EventType.valueOf(request.getEventType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }

        event = eventRepository.save(event);
        return toResponse(event);
    }

    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        event.setIsActive(false);
        eventRepository.save(event);
    }

    public void addParticipant(Long eventId, Long studentId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        boolean alreadyParticipant = eventParticipantRepository.findByEventId(eventId).stream()
                .anyMatch(ep -> ep.getStudent().getId().equals(studentId));

        if (alreadyParticipant) {
            throw new BadRequestException("Student is already a participant in this event");
        }

        EventParticipant participant = EventParticipant.builder()
                .event(event)
                .student(student)
                .build();

        eventParticipantRepository.save(participant);
    }

    public void removeParticipant(Long eventId, Long studentId) {
        EventParticipant participant = eventParticipantRepository.findByEventId(eventId).stream()
                .filter(ep -> ep.getStudent().getId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("EventParticipant", "eventId and studentId", eventId + ", " + studentId));

        eventParticipantRepository.delete(participant);
    }

    private EventResponse toResponse(Event event) {
        int participantCount = eventParticipantRepository.findByEventId(event.getId()).size();

        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getStartDate().toLocalDate())
                .venue(event.getLocation())
                .eventType(event.getEventType().name())
                .organizerName(event.getOrganizer() != null
                        ? event.getOrganizer().getFirstName() + " " + event.getOrganizer().getLastName()
                        : null)
                .participantCount(participantCount)
                .createdAt(event.getCreatedAt())
                .build();
    }
}
