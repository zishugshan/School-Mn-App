package com.schoolmanagement.service;

import com.schoolmanagement.dto.response.MarksResponse;
import com.schoolmanagement.entity.Marks;
import com.schoolmanagement.repository.MarksRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
public class MarksService {

    private final MarksRepository marksRepository;

    public List<MarksResponse> getMarksByStudent(Long studentId) {
        return marksRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getMarksSummary(Long studentId) {
        List<Marks> allMarks = marksRepository.findByStudentIdWithTest(studentId);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalTests", allMarks.size());

        if (allMarks.isEmpty()) {
            summary.put("overallAverage", 0.0);
            summary.put("highestScore", 0.0);
            summary.put("lowestScore", 0.0);
            summary.put("subjects", new ArrayList<>());
            return summary;
        }

        Double overallAvg = allMarks.stream()
                .mapToDouble(m -> m.getMarksObtained().doubleValue())
                .average()
                .orElse(0.0);

        Double highest = allMarks.stream()
                .mapToDouble(m -> m.getMarksObtained().doubleValue())
                .max()
                .orElse(0.0);

        Double lowest = allMarks.stream()
                .mapToDouble(m -> m.getMarksObtained().doubleValue())
                .min()
                .orElse(0.0);

        summary.put("overallAverage", BigDecimal.valueOf(overallAvg).setScale(2, RoundingMode.HALF_UP).doubleValue());
        summary.put("highestScore", BigDecimal.valueOf(highest).setScale(2, RoundingMode.HALF_UP).doubleValue());
        summary.put("lowestScore", BigDecimal.valueOf(lowest).setScale(2, RoundingMode.HALF_UP).doubleValue());

        Map<String, Map<String, Object>> subjectsMap = new LinkedHashMap<>();
        for (Marks m : allMarks) {
            String subjectName = m.getTest().getSubject().getName();
            subjectsMap.computeIfAbsent(subjectName, k -> {
                Map<String, Object> s = new LinkedHashMap<>();
                s.put("subjectName", k);
                s.put("marks", new ArrayList<Map<String, Object>>());
                s.put("average", 0.0);
                s.put("highest", 0.0);
                s.put("lowest", 0.0);
                return s;
            });

            List<Map<String, Object>> marksList = (List<Map<String, Object>>) subjectsMap.get(subjectName).get("marks");
            Map<String, Object> markEntry = new LinkedHashMap<>();
            markEntry.put("testId", m.getTest().getId());
            markEntry.put("testName", m.getTest().getTitle());
            markEntry.put("marksObtained", m.getMarksObtained());
            markEntry.put("maximumMarks", m.getTest().getMaximumMarks());
            markEntry.put("testDate", m.getTest().getTestDate());
            marksList.add(markEntry);
        }

        for (Map.Entry<String, Map<String, Object>> entry : subjectsMap.entrySet()) {
            List<Map<String, Object>> marksList = (List<Map<String, Object>>) entry.getValue().get("marks");
            double avg = marksList.stream()
                    .mapToDouble(m -> ((BigDecimal) m.get("marksObtained")).doubleValue())
                    .average()
                    .orElse(0.0);
            double high = marksList.stream()
                    .mapToDouble(m -> ((BigDecimal) m.get("marksObtained")).doubleValue())
                    .max()
                    .orElse(0.0);
            double low = marksList.stream()
                    .mapToDouble(m -> ((BigDecimal) m.get("marksObtained")).doubleValue())
                    .min()
                    .orElse(0.0);
            entry.getValue().put("average", BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue());
            entry.getValue().put("highest", BigDecimal.valueOf(high).setScale(2, RoundingMode.HALF_UP).doubleValue());
            entry.getValue().put("lowest", BigDecimal.valueOf(low).setScale(2, RoundingMode.HALF_UP).doubleValue());
        }

        summary.put("subjects", new ArrayList<>(subjectsMap.values()));
        return summary;
    }

    public List<Map<String, Object>> getMarksTrend(Long studentId) {
        List<Marks> allMarks = marksRepository.findByStudentIdWithTest(studentId);

        Map<YearMonth, List<Marks>> groupedByMonth = allMarks.stream()
                .collect(Collectors.groupingBy(
                        m -> YearMonth.from(m.getTest().getTestDate()),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<Map<String, Object>> trend = new ArrayList<>();
        for (Map.Entry<YearMonth, List<Marks>> entry : groupedByMonth.entrySet()) {
            YearMonth ym = entry.getKey();
            List<Marks> monthMarks = entry.getValue();

            double avgScore = monthMarks.stream()
                    .mapToDouble(m -> m.getMarksObtained().doubleValue())
                    .average()
                    .orElse(0.0);

            Map<String, Object> point = new LinkedHashMap<>();
            point.put("year", ym.getYear());
            point.put("month", ym.getMonthValue());
            point.put("monthName", ym.getMonth().name());
            point.put("averageScore", BigDecimal.valueOf(avgScore).setScale(2, RoundingMode.HALF_UP).doubleValue());
            point.put("testCount", monthMarks.size());

            trend.add(point);
        }

        return trend;
    }

    private MarksResponse toResponse(Marks marks) {
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
}
