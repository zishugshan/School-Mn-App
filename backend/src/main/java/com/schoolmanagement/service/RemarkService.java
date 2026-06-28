package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.RemarkRequest;
import com.schoolmanagement.dto.response.RemarkResponse;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.entity.TeacherRemark;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.TeacherRemarkRepository;
import com.schoolmanagement.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RemarkService {

    private final TeacherRemarkRepository teacherRemarkRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    @Transactional(readOnly = true)
    public List<RemarkResponse> getAllRemarks(Long studentId, Long teacherId) {
        if (studentId != null) {
            return getRemarksByStudent(studentId);
        }
        if (teacherId != null) {
            return getRemarksByTeacher(teacherId);
        }
        return teacherRemarkRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RemarkResponse> getRemarksByStudent(Long studentId) {
        return teacherRemarkRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RemarkResponse> getRemarksByTeacher(Long teacherId) {
        return teacherRemarkRepository.findByTeacherId(teacherId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RemarkResponse addRemark(RemarkRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getTeacherId()));

        TeacherRemark remark = TeacherRemark.builder()
                .student(student)
                .teacher(teacher)
                .remark(request.getRemark())
                .category(request.getCategory())
                .isPositive(true)
                .build();

        remark = teacherRemarkRepository.save(remark);
        return toResponse(remark);
    }

    public void deleteRemark(Long id) {
        TeacherRemark remark = teacherRemarkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remark", "id", id));
        teacherRemarkRepository.delete(remark);
    }

    private RemarkResponse toResponse(TeacherRemark remark) {
        RemarkResponse response = RemarkResponse.builder()
                .id(remark.getId())
                .studentId(remark.getStudent().getId())
                .studentName(remark.getStudent().getUser().getFirstName() + " " + remark.getStudent().getUser().getLastName())
                .studentCode(remark.getStudent().getStudentCode())
                .teacherId(remark.getTeacher().getId())
                .teacherName(remark.getTeacher().getUser().getFirstName() + " " + remark.getTeacher().getUser().getLastName())
                .remark(remark.getRemark())
                .category(remark.getCategory())
                .isPositive(remark.getIsPositive())
                .createdAt(remark.getCreatedAt())
                .build();
        if (remark.getSubject() != null) {
            response.setSubjectId(remark.getSubject().getId());
            response.setSubjectName(remark.getSubject().getName());
        }
        return response;
    }
}
