package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {

    List<Marks> findByTestId(Long testId);

    Optional<Marks> findByTestIdAndStudentId(Long testId, Long studentId);

    List<Marks> findByStudentId(Long studentId);

    @Query("SELECT AVG(m.marksObtained) FROM Marks m WHERE m.student.id = :studentId")
    Double findAverageMarksByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT MAX(m.marksObtained) FROM Marks m WHERE m.test.id = :testId")
    Double findHighestMarksByTestId(@Param("testId") Long testId);

    @Query("SELECT MIN(m.marksObtained) FROM Marks m WHERE m.test.id = :testId")
    Double findLowestMarksByTestId(@Param("testId") Long testId);

    @Query("SELECT m.student.id, SUM(m.marksObtained) FROM Marks m WHERE m.student.id IN :studentIds GROUP BY m.student.id ORDER BY SUM(m.marksObtained) DESC")
    List<Object[]> getTotalMarksByStudentIds(@Param("studentIds") List<Long> studentIds);

    @Query("SELECT m FROM Marks m JOIN FETCH m.test WHERE m.student.id = :studentId ORDER BY m.test.testDate DESC")
    List<Marks> findByStudentIdWithTest(@Param("studentId") Long studentId);
}
