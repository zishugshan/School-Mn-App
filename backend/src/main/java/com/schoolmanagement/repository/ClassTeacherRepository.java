package com.schoolmanagement.repository;

import com.schoolmanagement.entity.ClassTeacher;
import com.schoolmanagement.entity.ClassTeacher.ClassTeacherId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassTeacherRepository extends JpaRepository<ClassTeacher, ClassTeacherId> {
    List<ClassTeacher> findByTeacherId(Long teacherId);
    List<ClassTeacher> findByClassEntityId(Long classId);
    void deleteByTeacherId(Long teacherId);
}