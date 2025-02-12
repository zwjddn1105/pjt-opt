package com.opt.ssafy.optback.domain.chat.dto;

import com.opt.ssafy.optback.domain.chat.entity.ChatMessage;
import com.opt.ssafy.optback.domain.chat.entity.ChatMessage.MessageType;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChatRequest {
    private String id;
    private int senderId;
    private int receiverId;
    private String content;
    private LocalDateTime createdAt;
    private MessageType messageType;
    private LocalDateTime timestamp;

    public ChatRequest(ChatMessage chatMessage) {
        this.id = chatMessage.getId();
        this.senderId = chatMessage.getSenderId();
        this.receiverId = chatMessage.getReceiverId();
        this.content = chatMessage.getContent();
        this.createdAt = chatMessage.getCreatedAt();
    }
}
