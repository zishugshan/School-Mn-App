package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {

    List<Section> findByClassEntityId(Long classId);

    Optional<Section> findByCode(String code);

    List<Section> findByClassEntityIdAndIsActiveTrue(Long classId);

    Optional<Section> findByClassEntityIdAndName(Long classId, String name);
}
