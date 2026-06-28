package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.GoalRequest;
import com.schoolmanagement.dto.request.GoalSelfRequest;
import com.schoolmanagement.dto.response.GoalResponse;
import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.StudentClass;
import com.schoolmanagement.entity.StudentGoal;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.exception.BadRequestException;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.StudentClassRepository;
import com.schoolmanagement.repository.StudentGoalRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GoalService {

    private final StudentGoalRepository studentGoalRepository;
    private final StudentRepository studentRepository;
    private final StudentClassRepository studentClassRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<GoalResponse> getAllGoals(Long studentId) {
        if (studentId != null) {
            return getStudentGoals(studentId);
        }
        return studentGoalRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> getStudentGoals(Long studentId) {
        return studentGoalRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> getUserGoals(Long userId) {
        return studentGoalRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public GoalResponse markComplete(Long id) {
        StudentGoal goal = studentGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));
        goal.setIsCompleted(true);
        if (goal.getTargetScore() != null) {
            goal.setCurrentProgress(goal.getTargetScore());
        }
        goal = studentGoalRepository.save(goal);
        return toResponse(goal);
    }

    public List<GoalResponse> createGoal(GoalRequest request) {
        if (request.getClassId() == null) {
            throw new BadRequestException("classId is required");
        }

        ClassEntity classEntity = entityManager.find(ClassEntity.class, request.getClassId());
        if (classEntity == null) {
            throw new ResourceNotFoundException("Class", "id", request.getClassId());
        }

        BigDecimal targetValue = request.getTargetValue();

        List<Student> students = new ArrayList<>();

        if (request.getStudentCode() != null && !request.getStudentCode().isBlank()) {
            Student student = studentRepository.findByStudentCode(request.getStudentCode().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "studentCode", request.getStudentCode()));
            students.add(student);
        } else {
            List<StudentClass> scList = studentClassRepository.findByClassEntityId(request.getClassId());
            for (StudentClass sc : scList) {
                students.add(sc.getStudent());
            }
        }

        List<GoalResponse> responses = new ArrayList<>();
        for (Student student : students) {
            StudentGoal goal = StudentGoal.builder()
                    .student(student)
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .targetScore(targetValue)
                    .currentProgress(request.getCurrentProgress() != null ? request.getCurrentProgress() : BigDecimal.ZERO)
                    .category(request.getCategory())
                    .unit(request.getUnit())
                    .isCompleted(false)
                    .build();

            goal = studentGoalRepository.save(goal);
            responses.add(toResponse(goal));
        }

        return responses;
    }

    public GoalResponse createGoalForSelf(GoalSelfRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        StudentGoal.StudentGoalBuilder builder = StudentGoal.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .targetScore(request.getTargetValue())
                .currentProgress(request.getCurrentProgress() != null ? request.getCurrentProgress() : BigDecimal.ZERO)
                .category(request.getCategory())
                .unit(request.getUnit())
                .targetDate(request.getTargetDate())
                .isCompleted(false);

        studentRepository.findByUserId(userId).ifPresent(builder::student);

        StudentGoal goal = builder.build();
        goal = studentGoalRepository.save(goal);
        return toResponse(goal);
    }

    public GoalResponse updateProgress(Long id, BigDecimal progress) {
        StudentGoal goal = studentGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));

        goal.setCurrentProgress(progress);

        if (goal.getTargetScore() != null && progress.compareTo(goal.getTargetScore()) >= 0) {
            goal.setIsCompleted(true);
        }

        goal = studentGoalRepository.save(goal);
        return toResponse(goal);
    }

    public GoalResponse updateGoal(Long id, GoalRequest request) {
        StudentGoal goal = studentGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));

        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setTargetScore(request.getTargetValue());
        goal.setCurrentProgress(request.getCurrentProgress() != null ? request.getCurrentProgress() : goal.getCurrentProgress());
        goal.setCategory(request.getCategory());
        if (request.getUnit() != null) goal.setUnit(request.getUnit());

        if (goal.getTargetScore() != null && goal.getCurrentProgress() != null
                && goal.getCurrentProgress().compareTo(goal.getTargetScore()) >= 0) {
            goal.setIsCompleted(true);
        } else {
            goal.setIsCompleted(false);
        }

        goal = studentGoalRepository.save(goal);
        return toResponse(goal);
    }

    public void deleteGoal(Long id) {
        StudentGoal goal = studentGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));
        studentGoalRepository.delete(goal);
    }

    private GoalResponse toResponse(StudentGoal goal) {
        String status = (goal.getIsCompleted() != null && goal.getIsCompleted()) ? "COMPLETED" : "IN_PROGRESS";

        GoalResponse.GoalResponseBuilder builder = GoalResponse.builder()
                .id(goal.getId())
                .studentId(goal.getStudent() != null ? goal.getStudent().getId() : null)
                .studentName(goal.getStudent() != null
                        ? goal.getStudent().getUser().getFirstName() + " " + goal.getStudent().getUser().getLastName()
                        : null)
                .userId(goal.getUser() != null ? goal.getUser().getId() : null)
                .title(goal.getTitle())
                .description(goal.getDescription())
                .targetValue(goal.getTargetScore())
                .currentProgress(goal.getCurrentProgress())
                .unit(goal.getUnit())
                .category(goal.getCategory())
                .status(status)
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt());
        if (goal.getTargetDate() != null) {
            builder.targetDate(goal.getTargetDate());
        }
        return builder.build();
    }
}
