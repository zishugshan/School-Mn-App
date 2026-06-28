package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.ChatMessageRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.ChatMessageResponse;
import com.schoolmanagement.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/conversation/{userId1}/{userId2}")
    public ApiResponse<List<ChatMessageResponse>> getConversation(
            @PathVariable Long userId1, @PathVariable Long userId2) {
        List<ChatMessageResponse> messages = chatService.getConversation(userId1, userId2);
        return ApiResponse.success(messages, "Conversation retrieved successfully");
    }

    @PostMapping("/send")
    public ApiResponse<ChatMessageResponse> sendMessage(@Valid @RequestBody ChatMessageRequest request) {
        ChatMessageResponse response = chatService.sendMessage(request);
        return ApiResponse.success(response, "Message sent successfully");
    }

    @GetMapping("/unread/{userId}/count")
    public ApiResponse<Long> getUnreadCount(@PathVariable Long userId) {
        Long count = chatService.getUnreadCount(userId);
        return ApiResponse.success(count, "Unread count retrieved successfully");
    }

    @GetMapping("/conversations/{userId}")
    public ApiResponse<List<Map<String, Object>>> getUserConversations(@PathVariable Long userId) {
        List<Map<String, Object>> conversations = chatService.getUserConversations(userId);
        return ApiResponse.success(conversations, "Conversations retrieved successfully");
    }
}
