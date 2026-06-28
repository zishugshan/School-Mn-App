package com.schoolmanagement.repository;

import com.schoolmanagement.entity.FeeRecord;
import com.schoolmanagement.entity.enums.FeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeRecordRepository extends JpaRepository<FeeRecord, Long> {

    List<FeeRecord> findByStudentId(Long studentId);

    List<FeeRecord> findByStudentIdAndStatus(Long studentId, FeeStatus status);

    @Query("SELECT SUM(f.paidAmount) FROM FeeRecord f WHERE f.student.id = :studentId")
    Double getTotalPaidByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT SUM(f.amount) FROM FeeRecord f WHERE f.student.id = :studentId")
    Double getTotalDueByStudentId(@Param("studentId") Long studentId);
}
