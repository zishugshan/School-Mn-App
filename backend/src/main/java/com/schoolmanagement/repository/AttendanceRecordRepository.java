package com.schoolmanagement.repository;

import com.schoolmanagement.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    Optional<AttendanceRecord> findByClassEntityIdAndSectionIdAndDate(Long classId, Long sectionId, LocalDate date);

    List<AttendanceRecord> findByClassEntityIdAndSectionIdAndDateBetween(Long classId, Long sectionId, LocalDate start, LocalDate end);
}
