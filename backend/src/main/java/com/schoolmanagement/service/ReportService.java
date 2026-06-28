package com.schoolmanagement.service;

import com.schoolmanagement.entity.Attendance;
import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.Marks;
import com.schoolmanagement.entity.Section;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Test;
import com.schoolmanagement.entity.enums.AttendanceStatus;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.AttendanceRepository;
import com.schoolmanagement.repository.ClassRepository;
import com.schoolmanagement.repository.MarksRepository;
import com.schoolmanagement.repository.SectionRepository;
import com.schoolmanagement.repository.StudentClassRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.TestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final StudentRepository studentRepository;
    private final StudentClassRepository studentClassRepository;
    private final ClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final TestRepository testRepository;

    public byte[] generateStudentReportCard(Long studentId, String academicYear) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        ClassEntity classEntity = studentClassRepository.findByStudentIdAndIsActiveTrue(studentId)
                .map(sc -> sc.getClassEntity())
                .orElseThrow(() -> new ResourceNotFoundException("Class", "studentId", studentId));

        StringBuilder report = new StringBuilder();
        report.append("STUDENT REPORT CARD\n");
        report.append("====================\n\n");
        report.append("Student: ").append(student.getUser().getFirstName())
                .append(" ").append(student.getUser().getLastName()).append("\n");
        report.append("Code: ").append(student.getStudentCode()).append("\n");
        report.append("Class: ").append(classEntity.getName()).append("\n");
        report.append("Academic Year: ").append(academicYear).append("\n\n");

        report.append("--- MARKS ---\n");
        List<Test> tests = testRepository.findByClassEntityId(classEntity.getId());
        for (Test test : tests) {
            marksRepository.findByTestIdAndStudentId(test.getId(), studentId).ifPresent(mark -> {
                report.append(test.getTitle()).append(" (").append(test.getSubject().getName()).append("): ")
                        .append(mark.getMarksObtained()).append("/").append(test.getMaximumMarks()).append("\n");
            });
        }

        report.append("\n--- ATTENDANCE SUMMARY ---\n");
        LocalDate startOfYear = LocalDate.now().withDayOfYear(1);
        LocalDate today = LocalDate.now();
        List<Attendance> attendances = attendanceRepository
                .findByStudentIdAndDateBetween(studentId, startOfYear, today);
        long presentCount = attendances.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                .count();
        report.append("Total Days: ").append(attendances.size()).append("\n");
        report.append("Present: ").append(presentCount).append("\n");
        report.append("Attendance %: ").append(attendances.isEmpty() ? 0 :
                (presentCount * 100 / attendances.size())).append("%\n");

        return report.toString().getBytes();
    }

    public byte[] generateAttendanceReport(Long classId, Long sectionId,
                                           LocalDate startDate, LocalDate endDate) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", sectionId));

        List<Attendance> attendances = attendanceRepository
                .findByClassAndSectionAndDateRange(classId, sectionId, startDate, endDate);

        StringBuilder report = new StringBuilder();
        report.append("ATTENDANCE REPORT\n");
        report.append("==================\n\n");
        report.append("Class: ").append(classEntity.getName()).append("\n");
        report.append("Section: ").append(section.getName()).append("\n");
        report.append("Period: ").append(startDate).append(" to ").append(endDate).append("\n\n");
        report.append("Date,Student,Status\n");

        for (Attendance attendance : attendances) {
            report.append(attendance.getDate()).append(",")
                    .append(attendance.getStudent().getUser().getFirstName()).append(" ")
                    .append(attendance.getStudent().getUser().getLastName()).append(",")
                    .append(attendance.getStatus()).append("\n");
        }

        return report.toString().getBytes();
    }

    public byte[] generateClassReport(Long classId, String academicYear) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));

        StringBuilder report = new StringBuilder();
        report.append("CLASS REPORT\n");
        report.append("============\n\n");
        report.append("Class: ").append(classEntity.getName()).append("\n");
        report.append("Academic Year: ").append(academicYear).append("\n\n");

        List<Student> students = studentClassRepository.findByClassEntityId(classId).stream()
                .map(sc -> sc.getStudent())
                .toList();

        report.append("Total Students: ").append(students.size()).append("\n");

        for (Student student : students) {
            report.append("- ").append(student.getUser().getFirstName()).append(" ")
                    .append(student.getUser().getLastName())
                    .append(" (").append(student.getStudentCode()).append(")\n");
        }

        return report.toString().getBytes();
    }

    public byte[] exportToExcel(String reportType, Map<String, Object> params) {
        return switch (reportType) {
            case "attendance" -> {
                Long classId = (Long) params.get("classId");
                Long sectionId = (Long) params.get("sectionId");
                LocalDate start = (LocalDate) params.get("startDate");
                LocalDate end = (LocalDate) params.get("endDate");
                yield generateAttendanceReport(classId, sectionId, start, end);
            }
            case "reportCard" -> {
                Long studentId = (Long) params.get("studentId");
                String academicYear = (String) params.get("academicYear");
                yield generateStudentReportCard(studentId, academicYear);
            }
            case "classReport" -> {
                Long classIdCr = (Long) params.get("classId");
                String academicYearCr = (String) params.get("academicYear");
                yield generateClassReport(classIdCr, academicYearCr);
            }
            default -> new byte[0];
        };
    }
}
