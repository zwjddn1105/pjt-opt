package com.opt.ssafy.optback.domain.chat.entity;

import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_messages")
public class ChatMessage {

    @Id
    private String id;
    private int senderId;
    private int receiverId;
    private String content;
    private LocalDateTime createdAt;
    private MessageType messageType;
    private LocalDateTime timestamp;

    public enum MessageType {
        CHAT, SYSTEM
    }

    public void setSenderId(int senderId) {
        this.senderId = senderId;
    }
}
