package com.schoolmanagement.repository;

import com.schoolmanagement.entity.HomeworkSubmission;
import com.schoolmanagement.entity.enums.HomeworkStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HomeworkSubmissionRepository extends JpaRepository<HomeworkSubmission, Long> {

    Optional<HomeworkSubmission> findByHomeworkIdAndStudentId(Long homeworkId, Long studentId);

    List<HomeworkSubmission> findByHomeworkId(Long homeworkId);

    List<HomeworkSubmission> findByStudentId(Long studentId);

    List<HomeworkSubmission> findByStudentIdAndStatus(Long studentId, HomeworkStatus status);

    long countByStudentIdAndStatus(Long studentId, HomeworkStatus status);

    @Query("SELECT COUNT(hs) FROM HomeworkSubmission hs WHERE hs.student.id = :studentId AND hs.submittedAt BETWEEN :start AND :end")
    long countByStudentIdAndSubmittedAtBetween(@Param("studentId") Long studentId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
