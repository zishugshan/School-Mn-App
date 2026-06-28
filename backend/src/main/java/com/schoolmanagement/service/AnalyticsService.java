package com.schoolmanagement.service;

import com.schoolmanagement.entity.Attendance;
import com.schoolmanagement.entity.Homework;
import com.schoolmanagement.entity.HomeworkSubmission;
import com.schoolmanagement.entity.Marks;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Test;
import com.schoolmanagement.entity.enums.AttendanceStatus;
import com.schoolmanagement.entity.enums.Gender;
import com.schoolmanagement.repository.AttendanceRepository;
import com.schoolmanagement.repository.HomeworkRepository;
import com.schoolmanagement.repository.HomeworkSubmissionRepository;
import com.schoolmanagement.repository.MarksRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.repository.TestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final AttendanceRepository attendanceRepository;
    private final HomeworkRepository homeworkRepository;
    private final HomeworkSubmissionRepository homeworkSubmissionRepository;
    private final MarksRepository marksRepository;
    private final TestRepository testRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    public Map<String, Object> getAttendanceTrends(Long classId, Long sectionId, int year) {
        LocalDate startOfYear = LocalDate.of(year, 1, 1);
        LocalDate endOfYear = LocalDate.of(year, 12, 31);

        List<Attendance> attendances;
        if (sectionId != null) {
            attendances = attendanceRepository.findByClassAndSectionAndDateRange(classId, sectionId, startOfYear, endOfYear);
        } else {
            attendances = attendanceRepository.findByClassAndSectionAndDateRange(classId, sectionId, startOfYear, endOfYear);
        }

        Map<YearMonth, List<Attendance>> groupedByMonth = attendances.stream()
                .collect(Collectors.groupingBy(
                        a -> YearMonth.from(a.getDate()),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<Map<String, Object>> monthlyTrends = new ArrayList<>();
        for (Map.Entry<YearMonth, List<Attendance>> entry : groupedByMonth.entrySet()) {
            YearMonth ym = entry.getKey();
            long total = entry.getValue().size();
            long present = entry.getValue().stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                    .count();

            Map<String, Object> monthData = new LinkedHashMap<>();
            monthData.put("year", ym.getYear());
            monthData.put("month", ym.getMonthValue());
            monthData.put("monthName", ym.getMonth().name());
            monthData.put("total", total);
            monthData.put("present", present);
            monthData.put("percentage", total > 0
                    ? BigDecimal.valueOf(present).multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP).doubleValue()
                    : 0.0);
            monthlyTrends.add(monthData);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("classId", classId);
        result.put("sectionId", sectionId);
        result.put("year", year);
        result.put("monthlyTrends", monthlyTrends);
        return result;
    }

    public Map<String, Object> getSubjectPerformance(Long classId, Long subjectId) {
        List<Test> tests = testRepository.findByClassEntityId(classId).stream()
                .filter(t -> t.getSubject().getId().equals(subjectId))
                .collect(Collectors.toList());

        List<Map<String, Object>> testPerformances = new ArrayList<>();
        for (Test test : tests) {
            List<Marks> marksList = marksRepository.findByTestId(test.getId());

            double avg = marksList.stream()
                    .mapToDouble(m -> m.getMarksObtained().doubleValue())
                    .average()
                    .orElse(0.0);
            double highest = marksList.stream()
                    .mapToDouble(m -> m.getMarksObtained().doubleValue())
                    .max()
                    .orElse(0.0);
            double lowest = marksList.stream()
                    .mapToDouble(m -> m.getMarksObtained().doubleValue())
                    .min()
                    .orElse(0.0);

            Map<String, Object> testData = new LinkedHashMap<>();
            testData.put("testId", test.getId());
            testData.put("testName", test.getTitle());
            testData.put("testDate", test.getTestDate());
            testData.put("maximumMarks", test.getMaximumMarks());
            testData.put("averageScore", BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue());
            testData.put("highestScore", highest);
            testData.put("lowestScore", lowest);
            testData.put("studentCount", marksList.size());
            testPerformances.add(testData);
        }

        String subjectName = tests.isEmpty() ? "N/A" : tests.get(0).getSubject().getName();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("classId", classId);
        result.put("subjectName", subjectName);
        result.put("testPerformances", testPerformances);
        return result;
    }

    public Map<String, Object> getHomeworkCompletionTrends(Long classId, int year) {
        List<Homework> homeworkList = homeworkRepository.findByClassId(classId).stream()
                .filter(h -> h.getCreatedAt() != null && h.getCreatedAt().getYear() == year)
                .collect(Collectors.toList());

        List<Map<String, Object>> monthlyTrends = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            YearMonth ym = YearMonth.of(year, month);

            long totalAssigned = homeworkList.stream()
                    .filter(h -> {
                        if (h.getCreatedAt() == null) return false;
                        YearMonth hm = YearMonth.from(h.getCreatedAt().toLocalDate());
                        return hm.equals(ym);
                    })
                    .count();

            Map<String, Object> monthData = new LinkedHashMap<>();
            monthData.put("year", ym.getYear());
            monthData.put("month", ym.getMonthValue());
            monthData.put("monthName", ym.getMonth().name());
            monthData.put("totalAssigned", totalAssigned);
            monthData.put("completionRate", 0.0);

            if (totalAssigned > 0) {
                long totalSubmissions = 0;
                long completedSubmissions = 0;
                for (Homework hw : homeworkList) {
                    if (hw.getCreatedAt() == null) continue;
                    YearMonth hm = YearMonth.from(hw.getCreatedAt().toLocalDate());
                    if (hm.equals(ym)) {
                        List<HomeworkSubmission> submissions = homeworkSubmissionRepository.findByHomeworkId(hw.getId());
                        totalSubmissions += submissions.size();
                        completedSubmissions += submissions.stream()
                                .filter(s -> s.getStatus() == com.schoolmanagement.entity.enums.HomeworkStatus.COMPLETED)
                                .count();
                    }
                }
                double rate = totalSubmissions > 0
                        ? (double) completedSubmissions / totalSubmissions * 100
                        : 0.0;
                monthData.put("completionRate", BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP).doubleValue());
            }

            monthlyTrends.add(monthData);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("classId", classId);
        result.put("year", year);
        result.put("monthlyTrends", monthlyTrends);
        return result;
    }

    public Map<String, Object> getClassPerformance(Long classId, int year) {
        List<Test> tests = testRepository.findByClassEntityId(classId).stream()
                .filter(t -> t.getTestDate() != null && t.getTestDate().getYear() == year)
                .collect(Collectors.toList());

        double overallAverage = 0.0;
        double overallHighest = 0.0;
        double overallLowest = 0.0;
        int totalMarksEntries = 0;

        List<Map<String, Object>> testPerformances = new ArrayList<>();
        for (Test test : tests) {
            List<Marks> marksList = marksRepository.findByTestId(test.getId());
            if (marksList.isEmpty()) continue;

            double avg = marksList.stream()
                    .mapToDouble(m -> m.getMarksObtained().doubleValue())
                    .average()
                    .orElse(0.0);
            double highest = marksList.stream()
                    .mapToDouble(m -> m.getMarksObtained().doubleValue())
                    .max()
                    .orElse(0.0);
            double lowest = marksList.stream()
                    .mapToDouble(m -> m.getMarksObtained().doubleValue())
                    .min()
                    .orElse(0.0);

            overallAverage += avg * marksList.size();
            totalMarksEntries += marksList.size();
            overallHighest = Math.max(overallHighest, highest);
            overallLowest = overallLowest == 0.0 ? lowest : Math.min(overallLowest, lowest);

            Map<String, Object> testData = new LinkedHashMap<>();
            testData.put("testName", test.getTitle());
            testData.put("subject", test.getSubject().getName());
            testData.put("testDate", test.getTestDate());
            testData.put("average", BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue());
            testData.put("highest", highest);
            testData.put("lowest", lowest);
            testPerformances.add(testData);
        }

        if (totalMarksEntries > 0) {
            overallAverage = overallAverage / totalMarksEntries;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("classId", classId);
        result.put("year", year);
        result.put("overallAverage", BigDecimal.valueOf(overallAverage).setScale(2, RoundingMode.HALF_UP).doubleValue());
        result.put("overallHighest", overallHighest);
        result.put("overallLowest", overallLowest);
        result.put("testPerformances", testPerformances);
        return result;
    }

    public Map<String, Object> getSchoolPerformance(int year) {
        List<Test> tests = testRepository.findByIsPublishedTrue().stream()
                .filter(t -> t.getTestDate() != null && t.getTestDate().getYear() == year)
                .collect(Collectors.toList());

        long totalStudents = 0;
        double overallAverage = 0.0;
        int totalMarksEntries = 0;

        for (Test test : tests) {
            List<Marks> marksList = marksRepository.findByTestId(test.getId());
            if (marksList.isEmpty()) continue;

            double avg = marksList.stream()
                    .mapToDouble(m -> m.getMarksObtained().doubleValue())
                    .average()
                    .orElse(0.0);

            overallAverage += avg * marksList.size();
            totalMarksEntries += marksList.size();
            totalStudents = Math.max(totalStudents, marksList.size());
        }

        if (totalMarksEntries > 0) {
            overallAverage = overallAverage / totalMarksEntries;
        }

        long totalTeachersCount = teacherRepository.count();
        List<Student> allStudents = studentRepository.findByUserIsActiveTrue();
        long maleCount = allStudents.stream().filter(s -> s.getGender() == Gender.MALE).count();
        long femaleCount = allStudents.stream().filter(s -> s.getGender() == Gender.FEMALE).count();

        Map<String, Object> genderRatio = new LinkedHashMap<>();
        genderRatio.put("male", maleCount);
        genderRatio.put("female", femaleCount);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("year", year);
        result.put("totalStudents", totalStudents);
        result.put("totalTeachers", totalTeachersCount);
        result.put("totalTests", tests.size());
        result.put("overallAverage", BigDecimal.valueOf(overallAverage).setScale(2, RoundingMode.HALF_UP).doubleValue());
        result.put("genderRatio", genderRatio);
        return result;
    }
}
