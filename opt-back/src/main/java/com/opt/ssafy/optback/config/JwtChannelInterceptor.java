package com.opt.ssafy.optback.config;

import com.opt.ssafy.optback.domain.auth.application.JwtProvider;
import java.util.List;
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
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtProvider jwtProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            log.error("❌ [WebSocket] StompHeaderAccessor가 null입니다.");
            return message;
        }

        log.info("🟢 [WebSocket] STOMP Command: {}", accessor.getCommand());

        // ✅ CONNECT 요청에서만 Authorization 헤더를 체크하는 것이 아니라, SUBSCRIBE 및 SEND 요청도 처리해야 함
        if (StompCommand.CONNECT.equals(accessor.getCommand()) ||
                StompCommand.SUBSCRIBE.equals(accessor.getCommand()) ||
                StompCommand.SEND.equals(accessor.getCommand())) {

            log.info("🟢 [WebSocket] {} 요청 감지됨", accessor.getCommand());

            // ✅ WebSocket 요청에서 JWT 토큰 가져오기
            String jwtToken = extractToken(accessor);
            if (jwtToken == null) {
                log.error("❌ [WebSocket] Authorization 헤더가 존재하지 않음");
                throw new RuntimeException("❌ [WebSocket] Authorization 헤더가 존재하지 않음");
            }

            // ✅ JWT 검증
            if (!jwtProvider.validateToken(jwtToken)) {
                log.error("❌ [WebSocket] JWT 토큰 검증 실패!");
                throw new RuntimeException("Invalid token");
            }

            // ✅ JWT에서 사용자 정보 가져오기
//            String username = jwtProvider.getAuthentication(jwtToken).getName();
//            Authentication authentication = createAuthentication(username);

            Authentication authentication = jwtProvider.getAuthentication(jwtToken);
            if (authentication == null) {
                log.error("❌ [WebSocket] JWT에서 인증 정보를 가져오지 못했습니다.");
                return message;
            }

            // ✅ SecurityContext에 저장
            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);

            // ✅ WebSocket 세션에서도 인증 정보 설정
            accessor.setUser(authentication);

            log.info("✅ [WebSocket] 사용자 인증 성공 (사용자명: {})", authentication.getName());
        }

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String authorizationHeader = authHeaders.get(0);
            if (authorizationHeader.startsWith("Bearer ")) {
                return authorizationHeader.substring(7);
            }
        }
        return null;
    }

    private void setAuthentication(UserDetails userDetails, StompHeaderAccessor headerAccessor) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, // ✅ 올바르게 `UserDetails` 저장
                null,
                userDetails.getAuthorities()
        );
//    private Authentication createAuthentication(String username) {
//        return new UsernamePasswordAuthenticationToken(username, null,
//                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")));
//
    }
}
