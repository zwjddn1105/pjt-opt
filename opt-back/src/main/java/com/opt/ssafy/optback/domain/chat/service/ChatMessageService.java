package com.opt.ssafy.optback.domain.chat.service;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.chat.entity.ChatMessage;
import com.opt.ssafy.optback.domain.chat.repository.ChatMessageRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final UserDetailsServiceImpl userDetailsService;
    private final ChatMessageRepository chatMessageRepository;

    public ChatMessage processMessage(ChatMessage chatMessage) {
        int senderId = userDetailsService.getMemberByContextHolder().getId();
        chatMessage.setSenderId(senderId);
        chatMessage.setCreatedAt(LocalDateTime.now());
        System.out.println("📩 메시지 전송: " + chatMessage.getContent() + " (보낸 사람 ID: " + chatMessage.getId() + ")");
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        System.out.println("📩 [서버] MongoDB 저장 완료: " + savedMessage.getContent());
        return savedMessage;

    }

    public List<ChatMessage> getChatHistory(int receiverId) {
        int senderId = userDetailsService.getMemberByContextHolder().getId();
        return chatMessageRepository.findBySenderIdAndReceiverId(senderId, receiverId);
    }
}
