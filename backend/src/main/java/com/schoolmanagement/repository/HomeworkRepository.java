package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Homework;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HomeworkRepository extends JpaRepository<Homework, Long> {

    List<Homework> findByTeacherId(Long teacherId);

    List<Homework> findBySubjectId(Long subjectId);

    @Query("SELECT h FROM Homework h JOIN HomeworkTarget ht ON h.id = ht.homework.id WHERE ht.classEntity.id = :classId")
    List<Homework> findByClassId(@Param("classId") Long classId);

    @Query("SELECT DISTINCT h FROM Homework h JOIN HomeworkTarget ht ON h.id = ht.homework.id LEFT JOIN StudentClass sc ON sc.classEntity.id = ht.classEntity.id AND (ht.section IS NULL OR sc.section.id = ht.section.id) AND sc.isActive = true WHERE sc.student.id = :studentId OR ht.student.id = :studentId")
    List<Homework> findByStudentId(@Param("studentId") Long studentId);

    Page<Homework> findByDueDateBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    List<Homework> findByDueDateBeforeAndDueDateAfter(LocalDateTime before, LocalDateTime after);
}
