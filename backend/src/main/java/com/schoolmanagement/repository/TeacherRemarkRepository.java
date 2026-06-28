package com.schoolmanagement.repository;

import com.schoolmanagement.entity.TeacherRemark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRemarkRepository extends JpaRepository<TeacherRemark, Long> {

    List<TeacherRemark> findByStudentId(Long studentId);

    List<TeacherRemark> findByTeacherId(Long teacherId);
}
