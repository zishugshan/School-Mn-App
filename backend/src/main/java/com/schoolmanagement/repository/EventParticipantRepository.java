package com.schoolmanagement.repository;

import com.schoolmanagement.entity.EventParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {

    List<EventParticipant> findByEventId(Long eventId);

    List<EventParticipant> findByStudentId(Long studentId);
}
