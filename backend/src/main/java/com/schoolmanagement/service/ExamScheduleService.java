package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.ExamScheduleRequest;
import com.schoolmanagement.dto.response.ExamScheduleResponse;
import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.ExamSchedule;
import com.schoolmanagement.entity.Section;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.StudentClass;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.entity.enums.ExamType;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.ExamScheduleRepository;
import com.schoolmanagement.repository.SectionRepository;
import com.schoolmanagement.repository.StudentClassRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.StudentClassRepository;
import com.schoolmanagement.repository.SubjectRepository;
import com.schoolmanagement.repository.UserRepository;
import com.schoolmanagement.security.CustomUserDetails;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamScheduleService {

    private final ExamScheduleRepository examScheduleRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final StudentRepository studentRepository;
    private final StudentClassRepository studentClassRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    public ExamScheduleResponse createExam(ExamScheduleRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        ClassEntity classEntity = entityManager.find(ClassEntity.class, request.getClassId());
        if (classEntity == null) {
            throw new ResourceNotFoundException("Class", "id", request.getClassId());
        }

        ExamSchedule.ExamScheduleBuilder builder = ExamSchedule.builder()
                .title(request.getTitle())
                .subject(subject)
                .classEntity(classEntity)
                .date(LocalDate.parse(request.getDate()))
                .startTime(LocalTime.parse(request.getStartTime()))
                .endTime(LocalTime.parse(request.getEndTime()))
                .roomNumber(request.getRoom());

        if (request.getSectionId() != null) {
            Section section = sectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Section", "id", request.getSectionId()));
            builder.section(section);
        }

        if (request.getExamType() != null) {
            try {
                builder.examType(ExamType.valueOf(request.getExamType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }

        ExamSchedule exam = builder.build();
        exam = examScheduleRepository.save(exam);
        return toResponse(exam);
    }

    @Transactional(readOnly = true)
    public List<ExamScheduleResponse> getAllExams() {
        return examScheduleRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExamScheduleResponse> getExamsByClass(Long classId) {
        return examScheduleRepository.findByClassEntityId(classId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamScheduleResponse getExamById(Long id) {
        ExamSchedule exam = examScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ExamSchedule", "id", id));
        return toResponse(exam);
    }

    public ExamScheduleResponse updateExam(Long id, ExamScheduleRequest request) {
        ExamSchedule exam = examScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ExamSchedule", "id", id));

        exam.setTitle(request.getTitle());
        exam.setDate(LocalDate.parse(request.getDate()));
        exam.setStartTime(LocalTime.parse(request.getStartTime()));
        exam.setEndTime(LocalTime.parse(request.getEndTime()));
        exam.setRoomNumber(request.getRoom());

        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
            exam.setSubject(subject);
        }
        if (request.getClassId() != null) {
            ClassEntity classEntity = entityManager.find(ClassEntity.class, request.getClassId());
            if (classEntity == null) {
                throw new ResourceNotFoundException("Class", "id", request.getClassId());
            }
            exam.setClassEntity(classEntity);
        }
        if (request.getSectionId() != null) {
            Section section = sectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Section", "id", request.getSectionId()));
            exam.setSection(section);
        }
        if (request.getExamType() != null) {
            try {
                exam.setExamType(ExamType.valueOf(request.getExamType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }

        exam = examScheduleRepository.save(exam);
        return toResponse(exam);
    }

    public void deleteExam(Long id) {
        ExamSchedule exam = examScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ExamSchedule", "id", id));
        examScheduleRepository.delete(exam);
    }

    @Transactional(readOnly = true)
    public List<ExamScheduleResponse> getMySchedule() {
        User currentUser = getCurrentUser();
        String role = currentUser.getRole().name();

        if ("STUDENT".equals(role)) {
            Student student = studentRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "userId", currentUser.getId()));
            StudentClass sc = studentClassRepository.findByStudentIdAndIsActiveTrue(student.getId())
                    .orElse(null);
            if (sc == null) return List.of();
            Long classId = sc.getClassEntity().getId();
            Long sectionId = sc.getSection().getId();
            return examScheduleRepository.findByClassEntityId(classId).stream()
                    .filter(e -> e.getSection() == null || e.getSection().getId().equals(sectionId))
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        if ("TEACHER".equals(role)) {
            return getAllExams();
        }

        return getAllExams();
    }

    private ExamScheduleResponse toResponse(ExamSchedule exam) {
        return ExamScheduleResponse.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .examType(exam.getExamType() != null ? exam.getExamType().name() : null)
                .subjectName(exam.getSubject().getName())
                .className(exam.getClassEntity().getName())
                .sectionName(exam.getSection() != null ? exam.getSection().getName() : null)
                .date(exam.getDate())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .room(exam.getRoomNumber())
                .build();
    }

    private User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userRepository.findById(userDetails.getUserId())
                    .orElseThrow(() -> new RuntimeException("Current user not found"));
        }
        throw new RuntimeException("Authentication required");
    }
}
