package com.schoolmanagement.repository;

import com.schoolmanagement.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    List<CalendarEvent> findByEventDateBetween(LocalDate start, LocalDate end);

    List<CalendarEvent> findByIsHolidayTrue();

    List<CalendarEvent> findByIsExamTrue();
}
