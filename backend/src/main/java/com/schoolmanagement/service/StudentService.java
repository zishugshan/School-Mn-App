package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.StudentRequest;
import com.schoolmanagement.dto.response.PageResponse;
import com.schoolmanagement.dto.response.StudentDashboardResponse;
import com.schoolmanagement.dto.response.StudentDashboardResponse.HomeworkSummary;
import com.schoolmanagement.dto.response.StudentDashboardResponse.MonthlyPerformance;
import com.schoolmanagement.dto.response.StudentDashboardResponse.TestSummary;
import com.schoolmanagement.dto.response.StudentResponse;
import com.schoolmanagement.entity.Attendance;
import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.Homework;
import com.schoolmanagement.entity.HomeworkSubmission;
import com.schoolmanagement.entity.Marks;
import com.schoolmanagement.entity.Role;
import com.schoolmanagement.entity.Section;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.StudentClass;
import com.schoolmanagement.entity.Test;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.entity.enums.AttendanceStatus;
import com.schoolmanagement.entity.enums.HomeworkStatus;
import com.schoolmanagement.exception.BadRequestException;
import com.schoolmanagement.exception.DuplicateResourceException;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.mapper.StudentMapper;
import com.schoolmanagement.repository.AttendanceRepository;
import com.schoolmanagement.repository.HomeworkRepository;
import com.schoolmanagement.repository.HomeworkSubmissionRepository;
import com.schoolmanagement.repository.MarksRepository;
import com.schoolmanagement.repository.SectionRepository;
import com.schoolmanagement.repository.StudentClassRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.TestRepository;
import com.schoolmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final StudentClassRepository studentClassRepository;
    private final AttendanceRepository attendanceRepository;
    private final HomeworkRepository homeworkRepository;
    private final HomeworkSubmissionRepository homeworkSubmissionRepository;
    private final MarksRepository marksRepository;
    private final TestRepository testRepository;
    private final SectionRepository sectionRepository;
    private final StudentMapper studentMapper;
    private final StudentCodeGenerator studentCodeGenerator;

    public StudentResponse createStudent(StudentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("User role must be STUDENT to create a student profile");
        }

        String studentCode = studentCodeGenerator.generateStudentCode();

        Student student = studentMapper.toEntity(request);
        student.setUser(user);
        student.setStudentCode(studentCode);
        student.setAdmissionDate(LocalDate.now());

        if (request.getHouseId() != null) {
            // House is handled by the mapper's ignore - we set it here manually
            // The Student entity has a house field
        }

        Student savedStudent = studentRepository.save(student);

        return studentMapper.toResponse(savedStudent);
    }

    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        StudentResponse response = studentMapper.toResponse(student);
        enrichWithClassSection(response, student.getId());
        return response;
    }

    public StudentResponse getStudentByCode(String code) {
        Student student = studentRepository.findByStudentCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "studentCode", code));
        StudentResponse response = studentMapper.toResponse(student);
        enrichWithClassSection(response, student.getId());
        return response;
    }

    public StudentResponse getStudentByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "userId", userId));
        StudentResponse response = studentMapper.toResponse(student);
        enrichWithClassSection(response, student.getId());
        return response;
    }

    public PageResponse<StudentResponse> getAllStudents(Pageable pageable, String search) {
        Page<StudentResponse> page;
        if (search != null && !search.isBlank()) {
            page = searchStudents(search, pageable);
        } else {
            page = studentRepository.findAll(pageable)
                    .map(student -> {
                        StudentResponse response = studentMapper.toResponse(student);
                        enrichWithClassSection(response, student.getId());
                        return response;
                    });
        }
        return PageResponse.<StudentResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    public Page<StudentResponse> searchStudents(String query, Pageable pageable) {
        return studentRepository.findByUserFirstNameContainingOrUserLastNameContainingOrStudentCodeContaining(
                        query, query, query, pageable)
                .map(student -> {
                    StudentResponse response = studentMapper.toResponse(student);
                    enrichWithClassSection(response, student.getId());
                    return response;
                });
    }

    public StudentDashboardResponse getStudentDashboard(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        StudentClass activeClass = studentClassRepository.findByStudentIdAndIsActiveTrue(studentId)
                .orElse(null);

        double attendancePercentage = calculateAttendancePercentage(studentId);
        double homeworkCompletionRate = calculateHomeworkCompletionRate(studentId);
        Double averageMarks = marksRepository.findAverageMarksByStudentId(studentId);
        Integer rankInClass = calculateClassRank(studentId, activeClass);
        List<MonthlyPerformance> monthlyPerformance = calculateMonthlyPerformance(studentId);
        List<HomeworkSummary> recentHomework = getRecentHomework(studentId);
        List<TestSummary> upcomingTests = getUpcomingTests(studentId);

        StudentResponse studentResponse = studentMapper.toResponse(student);
        enrichWithClassSection(studentResponse, studentId);

        return StudentDashboardResponse.builder()
                .student(studentResponse)
                .attendancePercentage(attendancePercentage)
                .homeworkCompletionRate(homeworkCompletionRate)
                .averageMarks(averageMarks != null ? averageMarks : 0.0)
                .rankInClass(rankInClass)
                .monthlyPerformance(monthlyPerformance)
                .recentHomework(recentHomework)
                .upcomingTests(upcomingTests)
                .build();
    }

    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        studentMapper.updateEntity(request, student);

        Student updatedStudent = studentRepository.save(student);
        StudentResponse response = studentMapper.toResponse(updatedStudent);
        enrichWithClassSection(response, updatedStudent.getId());
        return response;
    }

    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        User user = student.getUser();
        user.setIsActive(false);
        userRepository.save(user);
    }

    public List<StudentResponse> getStudentsByClassId(Long classId) {
        List<StudentClass> studentClasses = studentClassRepository.findByClassEntityId(classId);
        return studentClasses.stream()
                .map(sc -> {
                    StudentResponse response = studentMapper.toResponse(sc.getStudent());
                    response.setClassId(classId);
                    response.setClassName(sc.getClassEntity().getName());
                    if (sc.getSection() != null) {
                        response.setSectionId(sc.getSection().getId());
                        response.setSectionName(sc.getSection().getName());
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    public List<StudentResponse> getStudentsByClassAndSection(Long classId, Long sectionId) {
        List<StudentClass> studentClasses = studentClassRepository.findStudentsByClassAndSection(classId, sectionId);
        return studentClasses.stream()
                .map(sc -> {
                    StudentResponse response = studentMapper.toResponse(sc.getStudent());
                    response.setClassId(classId);
                    response.setSectionId(sectionId);
                    response.setClassName(sc.getClassEntity().getName());
                    response.setSectionName(sc.getSection().getName());
                    return response;
                })
                .collect(Collectors.toList());
    }

    private void enrichWithClassSection(StudentResponse response, Long studentId) {
        studentClassRepository.findByStudentIdAndIsActiveTrue(studentId).ifPresent(sc -> {
            response.setClassId(sc.getClassEntity().getId());
            response.setSectionId(sc.getSection().getId());
            response.setClassName(sc.getClassEntity().getName());
            response.setSectionName(sc.getSection().getName());
        });
    }

    private double calculateAttendancePercentage(Long studentId) {
        LocalDate startOfYear = LocalDate.now().withDayOfYear(1);
        LocalDate today = LocalDate.now();
        List<Attendance> attendances = attendanceRepository.findByStudentIdAndDateBetween(studentId, startOfYear, today);
        if (attendances.isEmpty()) return 0.0;
        long presentCount = attendances.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                .count();
        return BigDecimal.valueOf(presentCount)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(attendances.size()), 2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private double calculateHomeworkCompletionRate(Long studentId) {
        long totalAssigned = homeworkRepository.findByStudentId(studentId).size();
        if (totalAssigned == 0) return 0.0;
        long completed = homeworkSubmissionRepository
                .countByStudentIdAndStatus(studentId, HomeworkStatus.COMPLETED);
        return BigDecimal.valueOf(completed)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalAssigned), 2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private Integer calculateClassRank(Long studentId, StudentClass activeClass) {
        if (activeClass == null) return null;
        List<StudentClass> classmates = studentClassRepository
                .findByClassEntityIdAndSectionIdAndIsActiveTrue(
                        activeClass.getClassEntity().getId(), activeClass.getSection().getId());
        List<Long> studentIds = classmates.stream()
                .map(sc -> sc.getStudent().getId())
                .collect(Collectors.toList());

        List<Object[]> totalMarks = marksRepository.getTotalMarksByStudentIds(studentIds);
        List<StudentRank> ranks = new ArrayList<>();
        for (Object[] row : totalMarks) {
            Long sid = (Long) row[0];
            BigDecimal total = (BigDecimal) row[1];
            ranks.add(new StudentRank(sid, total));
        }
        ranks.sort(Comparator.comparing(StudentRank::totalMarks).reversed());

        for (int i = 0; i < ranks.size(); i++) {
            if (ranks.get(i).studentId().equals(studentId)) {
                return i + 1;
            }
        }
        return null;
    }

    private record StudentRank(Long studentId, BigDecimal totalMarks) {}

    private List<MonthlyPerformance> calculateMonthlyPerformance(Long studentId) {
        List<MonthlyPerformance> performances = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now).minusMonths(i);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();

            List<Attendance> attendances = attendanceRepository
                    .findByStudentIdAndDateBetween(studentId, start, end);
            double attendanceRate = 0.0;
            if (!attendances.isEmpty()) {
                long present = attendances.stream()
                        .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                        .count();
                attendanceRate = BigDecimal.valueOf(present)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(attendances.size()), 2, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            List<Marks> monthMarks = marksRepository.findByStudentIdWithTest(studentId).stream()
                    .filter(m -> {
                        LocalDate testDate = m.getTest().getTestDate();
                        return (testDate.isAfter(start.minusDays(1)) && testDate.isBefore(end.plusDays(1)));
                    })
                    .collect(Collectors.toList());
            double avgScore = monthMarks.stream()
                    .mapToDouble(m -> m.getMarksObtained().doubleValue())
                    .average()
                    .orElse(0.0);

            performances.add(MonthlyPerformance.builder()
                    .year(ym.getYear())
                    .month(ym.getMonthValue())
                    .attendanceRate(attendanceRate)
                    .averageScore(avgScore)
                    .build());
        }
        return performances;
    }

    private List<HomeworkSummary> getRecentHomework(Long studentId) {
        return homeworkRepository.findByStudentId(studentId).stream()
                .sorted(Comparator.comparing(Homework::getDueDate).reversed())
                .limit(10)
                .map(hw -> {
                    HomeworkSubmission submission = homeworkSubmissionRepository
                            .findByHomeworkIdAndStudentId(hw.getId(), studentId).orElse(null);
                    return HomeworkSummary.builder()
                            .homeworkId(hw.getId())
                            .title(hw.getTitle())
                            .subjectName(hw.getSubject().getName())
                            .dueDate(hw.getDueDate())
                            .maxScore(hw.getMaxScore())
                            .score(submission != null ? submission.getScore() : null)
                            .status(submission != null ? submission.getStatus().name() : "PENDING")
                            .isOverdue(hw.getDueDate().isBefore(LocalDateTime.now())
                                    && (submission == null || submission.getStatus() != HomeworkStatus.COMPLETED))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<TestSummary> getUpcomingTests(Long studentId) {
        List<Test> tests = testRepository.findByStudentId(studentId);
        List<Test> upcoming = tests.stream()
                .filter(t -> t.getTestDate().isAfter(LocalDate.now()) || t.getTestDate().isEqual(LocalDate.now()))
                .sorted(Comparator.comparing(Test::getTestDate))
                .limit(3)
                .toList();
        if (!upcoming.isEmpty()) {
            return upcoming.stream().map(this::toTestSummary).collect(Collectors.toList());
        }
        return tests.stream()
                .sorted(Comparator.comparing(Test::getTestDate).reversed())
                .limit(3)
                .map(this::toTestSummary)
                .collect(Collectors.toList());
    }

    private TestSummary toTestSummary(Test t) {
        return TestSummary.builder()
                .testId(t.getId())
                .title(t.getTitle())
                .subjectName(t.getSubject().getName())
                .testDate(t.getTestDate())
                .maximumMarks(t.getMaximumMarks())
                .examType(t.getExamType() != null ? t.getExamType().name() : null)
                .build();
    }
}
