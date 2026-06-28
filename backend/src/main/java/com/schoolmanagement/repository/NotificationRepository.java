package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByIsGlobalTrueOrderByCreatedAtDesc();

    List<Notification> findByCreatedById(Long userId);
}
