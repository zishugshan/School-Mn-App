package com.schoolmanagement.repository;

import com.schoolmanagement.entity.BookIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookIssueRepository extends JpaRepository<BookIssue, Long> {

    List<BookIssue> findByStudentId(Long studentId);

    List<BookIssue> findByStatus(String status);

    List<BookIssue> findByDueDateBeforeAndReturnDateIsNull(LocalDate date);

    List<BookIssue> findByStudentUserId(Long userId);

    List<BookIssue> findAllByOrderByIssueDateDesc();
}
