package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.AttendanceRequest;
import com.schoolmanagement.dto.request.BulkAttendanceRequest;
import com.schoolmanagement.dto.response.AttendanceResponse;
import com.schoolmanagement.entity.Attendance;
import com.schoolmanagement.entity.AttendanceRecord;
import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.Section;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.entity.enums.AttendanceStatus;
import com.schoolmanagement.exception.BadRequestException;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.AttendanceRecordRepository;
import com.schoolmanagement.repository.AttendanceRepository;
import com.schoolmanagement.repository.SectionRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.UserRepository;
import com.schoolmanagement.security.CustomUserDetails;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentRepository studentRepository;
    private final SectionRepository sectionRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    private User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userRepository.findById(userDetails.getUserId())
                    .orElseThrow(() -> new RuntimeException("Current user not found"));
        }
        throw new RuntimeException("Authentication required");
    }

    public AttendanceResponse markAttendance(AttendanceRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));

        ClassEntity classEntity = entityManager.find(ClassEntity.class, request.getClassId());
        if (classEntity == null) {
            throw new ResourceNotFoundException("Class", "id", request.getClassId());
        }
        Section section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", request.getSectionId()));

        User currentUser = getCurrentUser();

        AttendanceStatus status;
        try {
            status = AttendanceStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid attendance status: " + request.getStatus());
        }

        Attendance existing = attendanceRepository.findByStudentIdAndDate(request.getStudentId(), request.getDate())
                .orElse(null);

        Attendance attendance;
        if (existing != null) {
            existing.setStatus(status);
            existing.setRemarks(request.getRemarks());
            existing.setMarkedBy(currentUser);
            attendance = attendanceRepository.save(existing);
        } else {
            attendance = Attendance.builder()
                    .student(student)
                    .classEntity(classEntity)
                    .section(section)
                    .date(request.getDate())
                    .status(status)
                    .markedBy(currentUser)
                    .remarks(request.getRemarks())
                    .isQrAttendance(false)
                    .build();
            attendance = attendanceRepository.save(attendance);
        }

        updateAttendanceRecord(classEntity, section, request.getDate(), currentUser);
        return toResponse(attendance);
    }

    public List<AttendanceResponse> markBulkAttendance(BulkAttendanceRequest request) {
        ClassEntity classEntity = entityManager.find(ClassEntity.class, request.getClassId());
        if (classEntity == null) {
            throw new ResourceNotFoundException("Class", "id", request.getClassId());
        }
        Section section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", request.getSectionId()));

        User currentUser = getCurrentUser();
        List<AttendanceResponse> responses = new ArrayList<>();

        for (BulkAttendanceRequest.StudentAttendanceEntry entry : request.getStudents()) {
            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", entry.getStudentId()));

            AttendanceStatus status;
            try {
                status = AttendanceStatus.valueOf(entry.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid attendance status: " + entry.getStatus());
            }

            Attendance existing = attendanceRepository.findByStudentIdAndDate(entry.getStudentId(), request.getDate())
                    .orElse(null);

            Attendance attendance;
            if (existing != null) {
                existing.setStatus(status);
                existing.setRemarks(entry.getRemarks());
                existing.setMarkedBy(currentUser);
                attendance = attendanceRepository.save(existing);
            } else {
                attendance = Attendance.builder()
                        .student(student)
                        .classEntity(classEntity)
                        .section(section)
                        .date(request.getDate())
                        .status(status)
                        .markedBy(currentUser)
                        .remarks(entry.getRemarks())
                        .isQrAttendance(false)
                        .build();
                attendance = attendanceRepository.save(attendance);
            }

            responses.add(toResponse(attendance));
        }

        updateAttendanceRecord(classEntity, section, request.getDate(), currentUser);
        return responses;
    }

    private void updateAttendanceRecord(ClassEntity classEntity, Section section, LocalDate date, User markedBy) {
        List<Attendance> all = attendanceRepository.findByClassEntityIdAndSectionIdAndDate(
                classEntity.getId(), section.getId(), date);

        int present = 0, absent = 0, late = 0, halfDay = 0, leave = 0;
        for (Attendance a : all) {
            switch (a.getStatus()) {
                case PRESENT -> present++;
                case ABSENT -> absent++;
                case LATE -> late++;
                case HALF_DAY -> halfDay++;
                case LEAVE -> leave++;
            }
        }

        AttendanceRecord record = attendanceRecordRepository
                .findByClassEntityIdAndSectionIdAndDate(classEntity.getId(), section.getId(), date)
                .orElse(AttendanceRecord.builder()
                        .classEntity(classEntity)
                        .section(section)
                        .date(date)
                        .markedBy(markedBy)
                        .build());

        record.setTotalStudents(all.size());
        record.setPresentCount(present);
        record.setAbsentCount(absent);
        record.setLateCount(late);
        record.setHalfDayCount(halfDay);
        record.setLeaveCount(leave);
        record.setMarkedBy(markedBy);
        attendanceRecordRepository.save(record);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getStudentAttendance(Long studentId, LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendanceList = attendanceRepository.findByStudentIdAndDateBetween(studentId, startDate, endDate);
        return attendanceList.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByClassAndDate(Long classId, Long sectionId, LocalDate date) {
        List<Attendance> attendanceList = attendanceRepository.findByClassEntityIdAndSectionIdAndDate(classId, sectionId, date);
        return attendanceList.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByClassAndDateRange(Long classId, Long sectionId, LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendanceList = attendanceRepository.findByClassAndSectionAndDateRange(classId, sectionId, startDate, endDate);
        return attendanceList.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceSummary(Long classId, Long sectionId, LocalDate date) {
        List<Object[]> summaryData = attendanceRepository.getAttendanceSummaryByClassAndDate(classId, sectionId, date);
        Map<String, Object> summary = new HashMap<>();
        summary.put("date", date);
        summary.put("total", 0);

        Map<String, Long> statusCount = new HashMap<>();
        for (Object[] row : summaryData) {
            String status = row[0].toString();
            Long count = (Long) row[1];
            statusCount.put(status.toLowerCase(), count);
        }
        summary.putAll(statusCount);

        long total = statusCount.values().stream().mapToLong(Long::longValue).sum();
        summary.put("total", total);

        return summary;
    }

    @Transactional(readOnly = true)
    public Double getAttendancePercentage(Long studentId, LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendanceList = attendanceRepository.findByStudentIdAndDateBetween(studentId, startDate, endDate);
        if (attendanceList.isEmpty()) return 0.0;

        long presentCount = attendanceList.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                .count();

        return (double) presentCount / attendanceList.size() * 100;
    }

    private AttendanceResponse toResponse(Attendance attendance) {
        return AttendanceResponse.builder()
                .id(attendance.getId())
                .studentId(attendance.getStudent().getId())
                .studentName(attendance.getStudent().getUser().getFirstName() + " " + attendance.getStudent().getUser().getLastName())
                .studentCode(attendance.getStudent().getStudentCode())
                .className(attendance.getClassEntity() != null ? attendance.getClassEntity().getName() : null)
                .sectionName(attendance.getSection() != null ? attendance.getSection().getName() : null)
                .date(attendance.getDate())
                .status(attendance.getStatus().name())
                .remarks(attendance.getRemarks())
                .isQrAttendance(attendance.getIsQrAttendance() != null && attendance.getIsQrAttendance())
                .createdAt(attendance.getCreatedAt())
                .build();
    }
}
