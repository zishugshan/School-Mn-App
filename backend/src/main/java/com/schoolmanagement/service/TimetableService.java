package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.TimetableEntryRequest;
import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.Section;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.entity.TimetableEntry;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.SectionRepository;
import com.schoolmanagement.repository.SubjectRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.repository.TimetableEntryRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class TimetableService {

    private final TimetableEntryRepository timetableEntryRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTimetable(Long classId, Long sectionId) {
        List<TimetableEntry> entries = timetableEntryRepository.findByClassEntityIdAndSectionId(classId, sectionId);

        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"};
        List<Map<String, Object>> timetable = new ArrayList<>();

        for (String day : days) {
            Map<String, Object> daySchedule = new LinkedHashMap<>();
            daySchedule.put("day", day);

            List<Map<String, Object>> periods = new ArrayList<>();
            for (TimetableEntry entry : entries) {
                String entryDay = getDayName(entry.getDayOfWeek());
                if (entryDay.equals(day)) {
                    Map<String, Object> period = new LinkedHashMap<>();
                    period.put("id", entry.getId());
                    period.put("subject", entry.getSubject().getName());
                    period.put("teacher", entry.getTeacher().getUser().getFirstName() + " " + entry.getTeacher().getUser().getLastName());
                    period.put("startTime", entry.getStartTime().toString());
                    period.put("endTime", entry.getEndTime().toString());
                    period.put("room", entry.getRoomNumber());
                    periods.add(period);
                }
            }

            daySchedule.put("periods", periods);
            timetable.add(daySchedule);
        }

        return timetable;
    }

    public Map<String, Object> createEntry(TimetableEntryRequest request) {
        ClassEntity classEntity = entityManager.find(ClassEntity.class, request.getClassId());
        if (classEntity == null) {
            throw new ResourceNotFoundException("Class", "id", request.getClassId());
        }
        Section section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", request.getSectionId()));
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getTeacherId()));

        TimetableEntry entry = TimetableEntry.builder()
                .classEntity(classEntity)
                .section(section)
                .subject(subject)
                .teacher(teacher)
                .dayOfWeek(getDayNumber(request.getDayOfWeek()))
                .startTime(LocalTime.parse(request.getStartTime()))
                .endTime(LocalTime.parse(request.getEndTime()))
                .roomNumber(request.getRoom())
                .isActive(true)
                .build();

        entry = timetableEntryRepository.save(entry);
        return entryToMap(entry);
    }

    public Map<String, Object> updateEntry(Long id, TimetableEntryRequest request) {
        TimetableEntry entry = timetableEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimetableEntry", "id", id));

        if (request.getClassId() != null) {
            ClassEntity classEntity = entityManager.find(ClassEntity.class, request.getClassId());
            if (classEntity == null) {
                throw new ResourceNotFoundException("Class", "id", request.getClassId());
            }
            entry.setClassEntity(classEntity);
        }
        if (request.getSectionId() != null) {
            Section section = sectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Section", "id", request.getSectionId()));
            entry.setSection(section);
        }
        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
            entry.setSubject(subject);
        }
        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getTeacherId()));
            entry.setTeacher(teacher);
        }

        entry.setDayOfWeek(getDayNumber(request.getDayOfWeek()));
        entry.setStartTime(LocalTime.parse(request.getStartTime()));
        entry.setEndTime(LocalTime.parse(request.getEndTime()));
        entry.setRoomNumber(request.getRoom());

        entry = timetableEntryRepository.save(entry);
        return entryToMap(entry);
    }

    public void deleteEntry(Long id) {
        TimetableEntry entry = timetableEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimetableEntry", "id", id));
        timetableEntryRepository.delete(entry);
    }

    private Map<String, Object> entryToMap(TimetableEntry entry) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", entry.getId());
        map.put("classId", entry.getClassEntity().getId());
        map.put("className", entry.getClassEntity().getName());
        map.put("sectionId", entry.getSection().getId());
        map.put("sectionName", entry.getSection().getName());
        map.put("subject", entry.getSubject().getName());
        map.put("teacher", entry.getTeacher().getUser().getFirstName() + " " + entry.getTeacher().getUser().getLastName());
        map.put("dayOfWeek", getDayName(entry.getDayOfWeek()));
        map.put("startTime", entry.getStartTime().toString());
        map.put("endTime", entry.getEndTime().toString());
        map.put("room", entry.getRoomNumber());
        return map;
    }

    private int getDayNumber(String day) {
        return switch (day.toUpperCase()) {
            case "MONDAY" -> 1;
            case "TUESDAY" -> 2;
            case "WEDNESDAY" -> 3;
            case "THURSDAY" -> 4;
            case "FRIDAY" -> 5;
            case "SATURDAY" -> 6;
            case "SUNDAY" -> 7;
            default -> 1;
        };
    }

    private String getDayName(int day) {
        return switch (day) {
            case 1 -> "MONDAY";
            case 2 -> "TUESDAY";
            case 3 -> "WEDNESDAY";
            case 4 -> "THURSDAY";
            case 5 -> "FRIDAY";
            case 6 -> "SATURDAY";
            case 7 -> "SUNDAY";
            default -> "MONDAY";
        };
    }
}
