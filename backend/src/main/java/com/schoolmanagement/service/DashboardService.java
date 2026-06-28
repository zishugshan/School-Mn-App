package com.schoolmanagement.service;

import com.schoolmanagement.dto.response.StudentDashboardResponse;
import com.schoolmanagement.dto.response.TeacherDashboardResponse;
import com.schoolmanagement.entity.Parent;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.ParentRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentService studentService;
    private final TeacherService teacherService;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;

    public StudentDashboardResponse getStudentDashboard(Long studentId) {
        return getStudentDashboardData(studentId);
    }

    public TeacherDashboardResponse getTeacherDashboard(Long teacherId) {
        return getTeacherDashboardData(teacherId);
    }

    public Map<String, Object> getParentDashboard(Long parentId) {
        return getParentDashboardData(parentId);
    }

    public StudentDashboardResponse getStudentDashboardData(Long studentId) {
        return studentService.getStudentDashboard(studentId);
    }

    public TeacherDashboardResponse getTeacherDashboardData(Long teacherId) {
        return teacherService.getTeacherDashboard(teacherId);
    }

    public Map<String, Object> getParentDashboardData(Long parentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent", "id", parentId));

        List<StudentDashboardResponse> studentDashboards = parent.getStudents().stream()
                .map(student -> studentService.getStudentDashboard(student.getId()))
                .collect(Collectors.toList());

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("parentId", parent.getId());
        dashboard.put("parentName", parent.getUser().getFirstName() + " " + parent.getUser().getLastName());
        dashboard.put("students", studentDashboards);
        return dashboard;
    }
}
