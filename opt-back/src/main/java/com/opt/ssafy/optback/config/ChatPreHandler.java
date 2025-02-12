package com.opt.ssafy.optback.config;

import com.opt.ssafy.optback.domain.auth.application.JwtProvider;
import java.util.Collections;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatPreHandler implements ChannelInterceptor {

    public static final String AUTHORIZATION = "Authorization";
    public static final String BEARER_ = "Bearer ";

    private final JwtProvider jwtProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        log.info("🟢 [WebSocket] CONNECT 요청 감지");

        Optional<String> jwtTokenOptional = Optional.ofNullable(accessor.getFirstNativeHeader(AUTHORIZATION));
        String jwtToken = jwtTokenOptional
                .filter(token -> token.startsWith(BEARER_))
                .map(token -> token.substring(BEARER_.length()))
                .filter(jwtProvider::validateToken) // ✅ 토큰 검증
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        log.info("🟢 [WebSocket] JWT 토큰 검증 완료");

        // ✅ JWT에서 사용자 정보 가져오기
        String username = jwtProvider.getAuthentication(jwtToken).getName();
        Authentication authentication = createAuthentication(username);

        // ✅ SecurityContext에 저장
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        // ✅ WebSocket 세션에서도 인증 정보 설정
        accessor.setUser(authentication);

        log.info("✅ [WebSocket] 사용자 인증 성공 (사용자명: {})", username);

        return message;
    }

    private Authentication createAuthentication(String username) {
        return new UsernamePasswordAuthenticationToken(username, null,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")));
    }
}
