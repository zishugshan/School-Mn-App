package com.schoolmanagement.repository;

import com.schoolmanagement.entity.HomeworkDoubt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HomeworkDoubtRepository extends JpaRepository<HomeworkDoubt, Long> {
    List<HomeworkDoubt> findByHomeworkIdOrderByCreatedAtAsc(Long homeworkId);
    List<HomeworkDoubt> findByHomeworkIdAndParentDoubtIsNullOrderByCreatedAtAsc(Long homeworkId);
    long countByHomeworkIdAndParentDoubtIsNotNull(Long homeworkId);
}
