package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.TeacherRequest;
import com.schoolmanagement.dto.request.UpdateTeacherRequest;
import com.schoolmanagement.dto.response.PageResponse;
import com.schoolmanagement.dto.response.TeacherDashboardResponse;
import com.schoolmanagement.dto.response.TeacherResponse;
import com.schoolmanagement.entity.Role;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.exception.BadRequestException;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.mapper.TeacherMapper;
import com.schoolmanagement.repository.AttendanceRepository;
import com.schoolmanagement.repository.ClassTeacherRepository;
import com.schoolmanagement.repository.HomeworkRepository;
import com.schoolmanagement.repository.SubjectRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.repository.TestRepository;
import com.schoolmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final HomeworkRepository homeworkRepository;
    private final AttendanceRepository attendanceRepository;
    private final TestRepository testRepository;
    private final TeacherMapper teacherMapper;
    private final ClassTeacherRepository classTeacherRepository;

    public TeacherResponse createTeacher(TeacherRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        if (user.getRole() != Role.TEACHER) {
            throw new BadRequestException("User role must be TEACHER to create a teacher profile");
        }

        Teacher teacher = teacherMapper.toEntity(request);
        teacher.setUser(user);
        teacher.setDateJoined(LocalDate.now());
        teacher.setTeacherCode(generateTeacherCode());

        Teacher savedTeacher = teacherRepository.save(teacher);
        return buildTeacherResponse(savedTeacher);
    }

    public TeacherResponse getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        return buildTeacherResponse(teacher);
    }

    public TeacherResponse getTeacherByUserId(Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "userId", userId));
        return buildTeacherResponse(teacher);
    }

    public PageResponse<TeacherResponse> getAllTeachers(Pageable pageable, String search) {
        Page<TeacherResponse> page;
        if (search != null && !search.isBlank()) {
            page = teacherRepository.findByUserFirstNameContainingOrUserLastNameContaining(search, search, pageable)
                    .map(this::buildTeacherResponse);
        } else {
            page = teacherRepository.findAll(pageable)
                    .map(this::buildTeacherResponse);
        }
        return PageResponse.<TeacherResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    public List<Map<String, Object>> getTeacherClasses(Long teacherId) {
        teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
        List<com.schoolmanagement.entity.ClassTeacher> assignments = classTeacherRepository.findByTeacherId(teacherId);
        return assignments.stream().map(ct -> {
            Map<String, Object> m = new HashMap<>();
            m.put("classId", ct.getClassEntity().getId());
            m.put("className", ct.getClassEntity().getName());
            m.put("sectionId", ct.getSection().getId());
            m.put("sectionName", ct.getSection().getName());
            m.put("isClassTeacher", ct.getIsClassTeacher());
            return m;
        }).collect(Collectors.toList());
    }

    public TeacherDashboardResponse getTeacherDashboard(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));

        int classesHandled = 0; // Would need a TeacherClassRepository to know exact count
        int homeworkAssigned = homeworkRepository.findByTeacherId(teacherId).size();
        int attendanceSubmitted = 0; // Attendance is tracked per class/section
        int testsConducted = testRepository.findByTeacherId(teacherId).size();
        Map<String, Object> performanceAnalytics = new HashMap<>();
        performanceAnalytics.put("homeworkAssigned", homeworkAssigned);
        performanceAnalytics.put("testsConducted", testsConducted);

        return TeacherDashboardResponse.builder()
                .teacher(buildTeacherResponse(teacher))
                .classesHandled(classesHandled)
                .homeworkAssigned(homeworkAssigned)
                .attendanceSubmitted(attendanceSubmitted)
                .testsConducted(testsConducted)
                .studentPerformanceAnalytics(performanceAnalytics)
                .build();
    }

    public TeacherResponse updateTeacher(Long id, UpdateTeacherRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));

        User user = teacher.getUser();
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getQualification() != null) teacher.setQualification(request.getQualification());
        if (request.getDateOfBirth() != null) teacher.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) teacher.setGender(
                com.schoolmanagement.entity.enums.Gender.valueOf(request.getGender()));
        if (request.getAddress() != null) teacher.setAddress(request.getAddress());
        if (request.getPhone() != null) teacher.setPhone(request.getPhone());

        userRepository.save(user);
        Teacher updatedTeacher = teacherRepository.save(teacher);
        return buildTeacherResponse(updatedTeacher);
    }

    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        User user = teacher.getUser();
        user.setIsActive(false);
        userRepository.save(user);
    }

    public void assignSubject(Long teacherId, Long subjectId) {
        assignSubjectToTeacher(teacherId, subjectId);
    }

    public void removeSubject(Long teacherId, Long subjectId) {
        removeSubjectFromTeacher(teacherId, subjectId);
    }

    public void assignSubjectToTeacher(Long teacherId, Long subjectId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", subjectId));

        teacher.getSubjects().add(subject);
        teacherRepository.save(teacher);
    }

    public void removeSubjectFromTeacher(Long teacherId, Long subjectId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", subjectId));

        teacher.getSubjects().remove(subject);
        teacherRepository.save(teacher);
    }

    private String generateTeacherCode() {
        return "TCH" + System.currentTimeMillis();
    }

    private TeacherResponse buildTeacherResponse(Teacher teacher) {
        TeacherResponse response = teacherMapper.toResponse(teacher);
        if (teacher.getSubjects() != null) {
            List<String> subjectNames = teacher.getSubjects().stream()
                    .map(Subject::getName)
                    .collect(Collectors.toList());
            response.setSubjects(subjectNames);
        } else {
            response.setSubjects(Collections.emptyList());
        }
        return response;
    }
}
