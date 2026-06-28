package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Optional<Teacher> findByTeacherCode(String teacherCode);

    Optional<Teacher> findByUserId(Long userId);

    List<Teacher> findByUserIsActiveTrue();

    Page<Teacher> findByUserFirstNameContainingOrUserLastNameContaining(String firstName, String lastName, Pageable pageable);

    @Query("SELECT t FROM Teacher t JOIN t.subjects s WHERE s.id = :subjectId")
    List<Teacher> findBySubjectId(@Param("subjectId") Long subjectId);
}
