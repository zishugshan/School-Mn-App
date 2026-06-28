package com.schoolmanagement.repository;

import com.schoolmanagement.entity.FeeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeTypeRepository extends JpaRepository<FeeType, Long> {

    List<FeeType> findByIsActiveTrue();
}
