package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentCode(String studentCode);

    Optional<Student> findByUserId(Long userId);

    List<Student> findByHouseId(Long houseId);

    List<Student> findByUserIsActiveTrue();

    Page<Student> findByUserFirstNameContainingOrUserLastNameContainingOrStudentCodeContaining(
            String firstName, String lastName, String studentCode, Pageable pageable);

    long countByHouseId(Long houseId);

    boolean existsByStudentCode(String studentCode);
}
