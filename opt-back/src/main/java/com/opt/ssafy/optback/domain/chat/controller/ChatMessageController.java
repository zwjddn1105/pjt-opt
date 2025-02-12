package com.opt.ssafy.optback.domain.chat.controller;

import com.opt.ssafy.optback.domain.chat.entity.ChatMessage;
import com.opt.ssafy.optback.domain.chat.service.ChatMessageService;
import com.opt.ssafy.optback.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;
    private final MemberRepository memberRepository;


    @MessageMapping("/chat")
    public ChatMessage sendMessage(ChatMessage message) {
        System.out.println("✅ [ChatController] 메시지 수신 확인: " + message.getContent());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            System.out.println("❌ [ChatController] SecurityContext에서 인증 정보를 찾을 수 없음!");
            throw new RuntimeException("❌ 인증되지 않은 사용자입니다.");
        }

        String email = authentication.getName();
        System.out.println("📩 [서버] 메시지 받음: " + message.getContent() + " (보낸 사람 이메일: " + email + ")");
        return chatMessageService.processMessage(message);
    }
}
