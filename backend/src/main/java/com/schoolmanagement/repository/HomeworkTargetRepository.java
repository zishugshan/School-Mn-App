package com.schoolmanagement.repository;

import com.schoolmanagement.entity.HomeworkTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeworkTargetRepository extends JpaRepository<HomeworkTarget, Long> {

    List<HomeworkTarget> findByHomeworkId(Long homeworkId);

    void deleteByHomeworkId(Long homeworkId);
}
