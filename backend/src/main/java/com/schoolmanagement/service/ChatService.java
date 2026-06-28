package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.ChatMessageRequest;
import com.schoolmanagement.dto.response.ChatMessageResponse;
import com.schoolmanagement.entity.ChatMessage;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.ChatMessageRepository;
import com.schoolmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getConversation(Long userId1, Long userId2) {
        return chatMessageRepository.findConversation(userId1, userId2).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getSenderId()));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getReceiverId()));

        ChatMessage message = ChatMessage.builder()
                .sender(sender)
                .receiver(receiver)
                .message(request.getContent())
                .isRead(false)
                .build();

        message = chatMessageRepository.save(message);
        return toResponse(message);
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return chatMessageRepository.countUnreadByReceiverId(userId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserConversations(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<ChatMessage> allMessages = chatMessageRepository.findAll();

        List<ChatMessage> latestMessages = new ArrayList<>();

        for (ChatMessage msg : allMessages) {
            boolean isParticipant = msg.getSender().getId().equals(userId) ||
                    msg.getReceiver().getId().equals(userId);

            if (!isParticipant) continue;

            Long otherUserId = msg.getSender().getId().equals(userId)
                    ? msg.getReceiver().getId()
                    : msg.getSender().getId();

            boolean replaced = false;
            for (int i = 0; i < latestMessages.size(); i++) {
                ChatMessage existing = latestMessages.get(i);
                Long existingOtherId = existing.getSender().getId().equals(userId)
                        ? existing.getReceiver().getId()
                        : existing.getSender().getId();

                if (existingOtherId.equals(otherUserId)) {
                    if (msg.getCreatedAt().isAfter(existing.getCreatedAt())) {
                        latestMessages.set(i, msg);
                    }
                    replaced = true;
                    break;
                }
            }

            if (!replaced) {
                latestMessages.add(msg);
            }
        }

        latestMessages.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        List<Map<String, Object>> conversations = new ArrayList<>();
        for (ChatMessage msg : latestMessages) {
            User otherUser = msg.getSender().getId().equals(userId)
                    ? msg.getReceiver()
                    : msg.getSender();

            long unreadCount = chatMessageRepository.findByReceiverIdAndIsReadFalse(userId).stream()
                    .filter(m -> m.getSender().getId().equals(otherUser.getId()))
                    .count();

            Map<String, Object> conv = new LinkedHashMap<>();
            conv.put("userId", otherUser.getId());
            conv.put("userName", otherUser.getFirstName() + " " + otherUser.getLastName());
            conv.put("userRole", otherUser.getRole().name());
            conv.put("profilePhoto", otherUser.getProfilePhoto());
            conv.put("lastMessage", msg.getMessage());
            conv.put("lastMessageTime", msg.getCreatedAt());
            conv.put("unreadCount", unreadCount);
            conversations.add(conv);
        }

        return conversations;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchUsers(String query) {
        List<User> users = userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                query, query, query);
        return users.stream().map(u -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getFirstName() + " " + u.getLastName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole().name());
            map.put("profilePhoto", u.getProfilePhoto());
            return map;
        }).collect(Collectors.toList());
    }

    private ChatMessageResponse toResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFirstName() + " " + message.getSender().getLastName())
                .receiverId(message.getReceiver().getId())
                .receiverName(message.getReceiver().getFirstName() + " " + message.getReceiver().getLastName())
                .content(message.getMessage())
                .isRead(message.getIsRead() != null && message.getIsRead())
                .sentAt(message.getCreatedAt())
                .readAt(message.getReadAt())
                .build();
    }
}
