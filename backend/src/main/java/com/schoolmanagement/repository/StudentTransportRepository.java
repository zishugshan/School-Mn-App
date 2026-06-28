package com.schoolmanagement.repository;

import com.schoolmanagement.entity.StudentTransport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentTransportRepository extends JpaRepository<StudentTransport, Long> {

    Optional<StudentTransport> findByStudentId(Long studentId);

    List<StudentTransport> findByRouteId(Long routeId);
}
