package com.schoolmanagement.repository;

import com.schoolmanagement.entity.StudentGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentGoalRepository extends JpaRepository<StudentGoal, Long> {

    List<StudentGoal> findByStudentId(Long studentId);

    List<StudentGoal> findByStudentIdAndIsCompleted(Long studentId, boolean isCompleted);

    List<StudentGoal> findByUserId(Long userId);
}
