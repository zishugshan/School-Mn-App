package com.schoolmanagement.repository;

import com.schoolmanagement.entity.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {

    Optional<ClassEntity> findByCode(String code);

    List<ClassEntity> findByIsActiveTrue();

    List<ClassEntity> findByNameContainingIgnoreCase(String name);
}
