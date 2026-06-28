package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);

    List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate start, LocalDate end);

    List<Attendance> findByClassEntityIdAndSectionIdAndDate(Long classId, Long sectionId, LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.classEntity.id = :classId AND a.section.id = :sectionId AND a.date BETWEEN :startDate AND :endDate")
    List<Attendance> findByClassAndSectionAndDateRange(@Param("classId") Long classId, @Param("sectionId") Long sectionId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a.status, COUNT(a) FROM Attendance a WHERE a.classEntity.id = :classId AND a.section.id = :sectionId AND a.date = :date GROUP BY a.status")
    List<Object[]> getAttendanceSummaryByClassAndDate(@Param("classId") Long classId, @Param("sectionId") Long sectionId, @Param("date") LocalDate date);

    @Query("SELECT a.student.id, COUNT(a) FROM Attendance a WHERE a.student.id IN :studentIds AND a.date BETWEEN :startDate AND :endDate AND a.status = 'PRESENT' GROUP BY a.student.id")
    List<Object[]> countPresentByStudentIdsAndDateRange(@Param("studentIds") List<Long> studentIds, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a.student.id, COUNT(a) FROM Attendance a WHERE a.student.id IN :studentIds AND a.date BETWEEN :startDate AND :endDate GROUP BY a.student.id")
    List<Object[]> countTotalByStudentIdsAndDateRange(@Param("studentIds") List<Long> studentIds, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
