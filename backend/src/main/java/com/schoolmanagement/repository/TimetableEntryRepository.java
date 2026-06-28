package com.schoolmanagement.repository;

import com.schoolmanagement.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {

    @Query("SELECT t FROM TimetableEntry t WHERE t.classEntity.id = :classId AND t.section.id = :sectionId AND (t.isActive IS NULL OR t.isActive = true)")
    List<TimetableEntry> findByClassEntityIdAndSectionId(@Param("classId") Long classId, @Param("sectionId") Long sectionId);

    List<TimetableEntry> findByTeacherId(Long teacherId);

    List<TimetableEntry> findByClassEntityIdAndSectionIdAndDayOfWeek(Long classId, Long sectionId, int dayOfWeek);
}
