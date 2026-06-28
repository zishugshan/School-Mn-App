package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.BulkMarksRequest;
import com.schoolmanagement.dto.request.TestRequest;
import com.schoolmanagement.dto.response.MarksResponse;
import com.schoolmanagement.dto.response.TestResponse;
import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.Marks;
import com.schoolmanagement.entity.Section;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.entity.Test;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.entity.enums.ExamType;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.MarksRepository;
import com.schoolmanagement.repository.SectionRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.SubjectRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.repository.TestRepository;
import com.schoolmanagement.repository.UserRepository;
import com.schoolmanagement.security.CustomUserDetails;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TestService {

    private final TestRepository testRepository;
    private final MarksRepository marksRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final EntityManager entityManager;
    private final UserRepository userRepository;

    public TestResponse createTest(TestRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
        ClassEntity classEntity = entityManager.find(ClassEntity.class, request.getClassId());
        if (classEntity == null) {
            throw new ResourceNotFoundException("Class", "id", request.getClassId());
        }
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getTeacherId()));

        Test.TestBuilder builder = Test.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .subject(subject)
                .classEntity(classEntity)
                .teacher(teacher)
                .maximumMarks(request.getMaximumMarks())
                .passingMarks(request.getPassingMarks())
                .testDate(request.getTestDate())
                .isPublished(false);

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

        Test test = builder.build();
        test = testRepository.save(test);
        return toResponse(test);
    }

    @Transactional(readOnly = true)
    public List<TestResponse> getTestsByTeacher(Long teacherId) {
        return testRepository.findByTeacherId(teacherId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestResponse> getTestsByClass(Long classId) {
        return testRepository.findByClassEntityId(classId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestResponse> getTestsByStudent(Long studentId) {
        return testRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestResponse getTestById(Long id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test", "id", id));
        return toResponse(test);
    }

    public TestResponse updateTest(Long id, TestRequest request) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test", "id", id));

        test.setTitle(request.getTitle());
        test.setDescription(request.getDescription());
        test.setMaximumMarks(request.getMaximumMarks());
        test.setPassingMarks(request.getPassingMarks());
        test.setTestDate(request.getTestDate());

        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
            test.setSubject(subject);
        }
        if (request.getClassId() != null) {
            ClassEntity classEntity = entityManager.find(ClassEntity.class, request.getClassId());
            if (classEntity == null) {
                throw new ResourceNotFoundException("Class", "id", request.getClassId());
            }
            test.setClassEntity(classEntity);
        }
        if (request.getSectionId() != null) {
            Section section = sectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Section", "id", request.getSectionId()));
            test.setSection(section);
        }
        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getTeacherId()));
            test.setTeacher(teacher);
        }
        if (request.getExamType() != null) {
            try {
                test.setExamType(ExamType.valueOf(request.getExamType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }

        test = testRepository.save(test);
        return toResponse(test);
    }

    public void deleteTest(Long id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test", "id", id));
        testRepository.delete(test);
    }

    public void publishTest(Long testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test", "id", testId));
        test.setIsPublished(true);
        testRepository.save(test);
    }

    @Transactional
    public List<MarksResponse> enterMarks(BulkMarksRequest request) {
        Test test = testRepository.findById(request.getTestId())
                .orElseThrow(() -> new ResourceNotFoundException("Test", "id", request.getTestId()));

        User currentUser = getCurrentUser();
        List<MarksResponse> responses = new ArrayList<>();

        for (BulkMarksRequest.StudentMarksEntry entry : request.getMarks()) {
            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", entry.getStudentId()));

            Marks existing = marksRepository.findByTestIdAndStudentId(request.getTestId(), entry.getStudentId())
                    .orElse(null);

            Marks marks;
            if (existing != null) {
                existing.setMarksObtained(entry.getMarksObtained());
                existing.setRemarks(entry.getRemarks());
                marks = marksRepository.save(existing);
            } else {
                marks = Marks.builder()
                        .test(test)
                        .student(student)
                        .marksObtained(entry.getMarksObtained())
                        .remarks(entry.getRemarks())
                        .enteredBy(currentUser)
                        .build();
                marks = marksRepository.save(marks);
            }

            responses.add(toMarksResponse(marks));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public List<MarksResponse> getMarksByTest(Long testId) {
        return marksRepository.findByTestId(testId).stream()
                .map(this::toMarksResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MarksResponse getMarksByTestAndStudent(Long testId, Long studentId) {
        Marks marks = marksRepository.findByTestIdAndStudentId(testId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Marks", "testId and studentId", testId + ", " + studentId));
        return toMarksResponse(marks);
    }

    @Transactional(readOnly = true)
    public List<MarksResponse> getTestLeaderboard(Long testId) {
        return marksRepository.findByTestId(testId).stream()
                .sorted(Comparator.comparing(Marks::getMarksObtained).reversed())
                .map(this::toMarksResponse)
                .collect(Collectors.toList());
    }

    private TestResponse toResponse(Test test) {
        return TestResponse.builder()
                .id(test.getId())
                .title(test.getTitle())
                .description(test.getDescription())
                .subjectName(test.getSubject().getName())
                .className(test.getClassEntity().getName())
                .sectionName(test.getSection() != null ? test.getSection().getName() : null)
                .teacherName(test.getTeacher().getUser().getFirstName() + " " + test.getTeacher().getUser().getLastName())
                .maximumMarks(test.getMaximumMarks())
                .passingMarks(test.getPassingMarks())
                .testDate(test.getTestDate())
                .examType(test.getExamType() != null ? test.getExamType().name() : null)
                .isPublished(test.getIsPublished() != null && test.getIsPublished())
                .createdAt(test.getCreatedAt())
                .build();
    }

    private MarksResponse toMarksResponse(Marks marks) {
        return MarksResponse.builder()
                .id(marks.getId())
                .testId(marks.getTest().getId())
                .testName(marks.getTest().getTitle())
                .studentId(marks.getStudent().getId())
                .studentName(marks.getStudent().getUser().getFirstName() + " " + marks.getStudent().getUser().getLastName())
                .studentCode(marks.getStudent().getStudentCode())
                .marksObtained(marks.getMarksObtained())
                .maximumMarks(marks.getTest().getMaximumMarks())
                .remarks(marks.getRemarks())
                .createdAt(marks.getCreatedAt())
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
