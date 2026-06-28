package com.schoolmanagement.service;

import com.schoolmanagement.dto.response.LeaderboardResponse;
import com.schoolmanagement.entity.Attendance;
import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.HomeworkSubmission;
import com.schoolmanagement.entity.Leaderboard;
import com.schoolmanagement.entity.Marks;
import com.schoolmanagement.entity.Section;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.enums.AttendanceStatus;
import com.schoolmanagement.entity.enums.HomeworkStatus;
import com.schoolmanagement.entity.enums.LeaderboardCategory;
import com.schoolmanagement.entity.enums.LeaderboardPeriod;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.AttendanceRepository;
import com.schoolmanagement.repository.ClassRepository;
import com.schoolmanagement.repository.HomeworkRepository;
import com.schoolmanagement.repository.HomeworkSubmissionRepository;
import com.schoolmanagement.repository.LeaderboardRepository;
import com.schoolmanagement.repository.MarksRepository;
import com.schoolmanagement.repository.StudentClassRepository;
import com.schoolmanagement.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaderboardService {

    private final LeaderboardRepository leaderboardRepository;
    private final AttendanceRepository attendanceRepository;
    private final HomeworkRepository homeworkRepository;
    private final HomeworkSubmissionRepository homeworkSubmissionRepository;
    private final MarksRepository marksRepository;
    private final StudentRepository studentRepository;
    private final StudentClassRepository studentClassRepository;
    private final ClassRepository classRepository;

    public void calculateMonthlyAttendanceLeaderboard(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Student> allStudents = studentRepository.findByUserIsActiveTrue();
        List<Leaderboard> entries = new ArrayList<>();

        for (Student student : allStudents) {
            List<Attendance> attendances = attendanceRepository
                    .findByStudentIdAndDateBetween(student.getId(), startDate, endDate);

            if (attendances.isEmpty()) continue;

            long presentCount = attendances.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                    .count();

            double percentage = BigDecimal.valueOf(presentCount)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(attendances.size()), 2, RoundingMode.HALF_UP)
                    .doubleValue();

            Leaderboard entry = Leaderboard.builder()
                    .student(student)
                    .category(LeaderboardCategory.ATTENDANCE)
                    .period(LeaderboardPeriod.MONTHLY)
                    .score(BigDecimal.valueOf(percentage))
                    .rank(0)
                    .year(year)
                    .month(month)
                    .build();

            studentClassRepository.findByStudentIdAndIsActiveTrue(student.getId()).ifPresent(sc -> {
                entry.setClassEntity(sc.getClassEntity());
                entry.setSection(sc.getSection());
            });

            entries.add(entry);
        }

        entries.sort(Comparator.comparing(Leaderboard::getScore).reversed());
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        leaderboardRepository.saveAll(entries);
    }

    public void calculateMonthlyHomeworkLeaderboard(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Student> allStudents = studentRepository.findByUserIsActiveTrue();
        List<Leaderboard> entries = new ArrayList<>();

        for (Student student : allStudents) {
            List<HomeworkSubmission> submissions = homeworkSubmissionRepository
                    .findByStudentId(student.getId()).stream()
                    .filter(s -> s.getSubmittedAt() != null)
                    .filter(s -> {
                        LocalDate subDate = s.getSubmittedAt().toLocalDate();
                        return !subDate.isBefore(startDate) && !subDate.isAfter(endDate);
                    })
                    .collect(Collectors.toList());

            if (submissions.isEmpty()) continue;

            long completedCount = submissions.stream()
                    .filter(s -> s.getStatus() == HomeworkStatus.COMPLETED || s.getStatus() == HomeworkStatus.SUBMITTED)
                    .count();

            double completionRate = BigDecimal.valueOf(completedCount)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(submissions.size()), 2, RoundingMode.HALF_UP)
                    .doubleValue();

            Leaderboard entry = Leaderboard.builder()
                    .student(student)
                    .category(LeaderboardCategory.HOMEWORK)
                    .period(LeaderboardPeriod.MONTHLY)
                    .score(BigDecimal.valueOf(completionRate))
                    .rank(0)
                    .year(year)
                    .month(month)
                    .build();

            studentClassRepository.findByStudentIdAndIsActiveTrue(student.getId()).ifPresent(sc -> {
                entry.setClassEntity(sc.getClassEntity());
                entry.setSection(sc.getSection());
            });

            entries.add(entry);
        }

        entries.sort(Comparator.comparing(Leaderboard::getScore).reversed());
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        leaderboardRepository.saveAll(entries);
    }

    public void calculateAcademicLeaderboard(Long testId) {
        List<Marks> marksList = marksRepository.findByTestId(testId);
        if (marksList.isEmpty()) return;

        List<Leaderboard> entries = new ArrayList<>();

        for (Marks mark : marksList) {
            Student student = mark.getStudent();

            Leaderboard entry = Leaderboard.builder()
                    .student(student)
                    .category(LeaderboardCategory.ACADEMICS)
                    .period(LeaderboardPeriod.MONTHLY)
                    .score(mark.getMarksObtained())
                    .rank(0)
                    .year(mark.getTest().getTestDate().getYear())
                    .month(mark.getTest().getTestDate().getMonthValue())
                    .build();

            studentClassRepository.findByStudentIdAndIsActiveTrue(student.getId()).ifPresent(sc -> {
                entry.setClassEntity(sc.getClassEntity());
                entry.setSection(sc.getSection());
            });

            entries.add(entry);
        }

        entries.sort(Comparator.comparing(Leaderboard::getScore).reversed());
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        leaderboardRepository.saveAll(entries);
    }

    public List<LeaderboardResponse> getLeaderboardByCategory(String category, String period,
                                                               int year, Integer month) {
        LeaderboardCategory cat = LeaderboardCategory.valueOf(category.toUpperCase());
        LeaderboardPeriod per = LeaderboardPeriod.valueOf(period.toUpperCase());

        List<Leaderboard> entries = leaderboardRepository
                .findByCategoryAndPeriodAndYearAndMonthOrderByRankAsc(cat, per, year, month);

        return entries.stream()
                .map(this::toLeaderboardResponse)
                .collect(Collectors.toList());
    }

    public List<LeaderboardResponse> getClassLeaderboard(Long classId, String category, String period,
                                                         int year, Integer month) {
        LeaderboardCategory cat = LeaderboardCategory.valueOf(category.toUpperCase());
        LeaderboardPeriod per = LeaderboardPeriod.valueOf(period.toUpperCase());

        List<Leaderboard> entries = leaderboardRepository
                .findByClassEntityIdAndCategoryAndPeriodAndYearAndMonthOrderByRankAsc(
                        classId, cat, per, year, month);

        return entries.stream()
                .map(this::toLeaderboardResponse)
                .collect(Collectors.toList());
    }

    public List<LeaderboardResponse> getTop10Leaderboard(String category, String period,
                                                         int year, Integer month) {
        LeaderboardCategory cat = LeaderboardCategory.valueOf(category.toUpperCase());
        LeaderboardPeriod per = LeaderboardPeriod.valueOf(period.toUpperCase());

        List<Leaderboard> entries = leaderboardRepository
                .findTop10ByCategoryAndPeriodAndYearAndMonth(cat, per, year, month, PageRequest.of(0, 10));

        return entries.stream()
                .map(this::toLeaderboardResponse)
                .collect(Collectors.toList());
    }

    public List<LeaderboardResponse> getLeaderboard(String category, String period, int year, Integer month) {
        return getLeaderboardByCategory(category, period, year, month);
    }

    public List<LeaderboardResponse> getTop10(String category, String period, int year, Integer month) {
        return getTop10Leaderboard(category, period, year, month);
    }

    public List<LeaderboardResponse> getStudentLeaderboardEntries(Long studentId) {
        return leaderboardRepository.findByStudentId(studentId).stream()
                .map(this::toLeaderboardResponse)
                .collect(Collectors.toList());
    }

    private LeaderboardResponse toLeaderboardResponse(Leaderboard entry) {
        Student student = entry.getStudent();
        return LeaderboardResponse.builder()
                .rank(entry.getRank())
                .studentId(student.getId())
                .studentCode(student.getStudentCode())
                .studentName(student.getUser().getFirstName() + " " + student.getUser().getLastName())
                .className(entry.getClassEntity() != null ? entry.getClassEntity().getName() : null)
                .sectionName(entry.getSection() != null ? entry.getSection().getName() : null)
                .score(entry.getScore().doubleValue())
                .category(entry.getCategory().name())
                .period(entry.getPeriod().name())
                .build();
    }
}
