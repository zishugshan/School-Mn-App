package com.schoolmanagement.repository;

import com.schoolmanagement.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT cm FROM ChatMessage cm WHERE (cm.sender.id = :userId1 AND cm.receiver.id = :userId2) OR (cm.sender.id = :userId2 AND cm.receiver.id = :userId1) ORDER BY cm.createdAt ASC")
    List<ChatMessage> findConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    List<ChatMessage> findByReceiverIdAndIsReadFalse(Long receiverId);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.receiver.id = :userId AND cm.isRead = false")
    long countUnreadByReceiverId(@Param("userId") Long userId);
}
