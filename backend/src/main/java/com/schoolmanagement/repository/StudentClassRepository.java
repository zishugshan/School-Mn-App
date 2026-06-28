package com.schoolmanagement.repository;

import com.schoolmanagement.entity.StudentClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentClassRepository extends JpaRepository<StudentClass, Long> {

    Optional<StudentClass> findByStudentIdAndIsActiveTrue(Long studentId);

    List<StudentClass> findByClassEntityIdAndSectionIdAndIsActiveTrue(Long classId, Long sectionId);

    List<StudentClass> findByClassEntityId(Long classId);

    List<StudentClass> findByAcademicYear(String academicYear);

    @Query("SELECT sc FROM StudentClass sc JOIN FETCH sc.student WHERE sc.classEntity.id = :classId AND sc.section.id = :sectionId AND sc.isActive = true")
    List<StudentClass> findStudentsByClassAndSection(@Param("classId") Long classId, @Param("sectionId") Long sectionId);
}
