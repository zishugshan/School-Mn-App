package com.schoolmanagement.repository;

import com.schoolmanagement.entity.ExamSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamScheduleRepository extends JpaRepository<ExamSchedule, Long> {

    List<ExamSchedule> findByClassEntityId(Long classId);

    List<ExamSchedule> findByClassEntityIdAndDateBetween(Long classId, LocalDate start, LocalDate end);
}
