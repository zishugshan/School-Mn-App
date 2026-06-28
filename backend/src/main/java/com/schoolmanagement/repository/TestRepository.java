package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {

    List<Test> findByTeacherId(Long teacherId);

    List<Test> findByClassEntityId(Long classId);

    List<Test> findByClassEntityIdAndSectionId(Long classId, Long sectionId);

    List<Test> findBySubjectId(Long subjectId);

    List<Test> findByIsPublishedTrue();

    @Query("SELECT t FROM Test t WHERE t.classEntity.id IN (SELECT sc.classEntity.id FROM StudentClass sc WHERE sc.student.id = :studentId AND sc.isActive = true) AND (t.section IS NULL OR t.section.id IN (SELECT sc2.section.id FROM StudentClass sc2 WHERE sc2.student.id = :studentId AND sc2.isActive = true))")
    List<Test> findByStudentId(@Param("studentId") Long studentId);
}
