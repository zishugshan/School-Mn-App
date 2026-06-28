package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByHouseId(Long houseId);

    List<Event> findByStartDateBetween(LocalDateTime start, LocalDateTime end);

    List<Event> findByIsActiveTrue();
}
