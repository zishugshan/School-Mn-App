package com.schoolmanagement.repository;

import com.schoolmanagement.entity.LibraryResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibraryResourceRepository extends JpaRepository<LibraryResource, Long> {

    List<LibraryResource> findAllByOrderByCreatedAtDesc();

    List<LibraryResource> findByCategoryOrderByCreatedAtDesc(String category);

    List<LibraryResource> findByClassEntityIdOrderByCreatedAtDesc(Long classId);

    List<LibraryResource> findByResourceTypeOrderByCreatedAtDesc(String resourceType);

    List<LibraryResource> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title);
}
