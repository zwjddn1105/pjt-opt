package com.opt.ssafy.optback.domain.auth.filter;

import com.opt.ssafy.optback.domain.auth.application.JwtProvider;
import com.opt.ssafy.optback.domain.auth.application.TokenBlacklistService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("🐿️ JWT 필터 실행 요청 URI: " + request.getRequestURI());
        if (request.getRequestURI().startsWith("/auth")) {
            System.out.println("🐿️ /auth 요청 JWT 필터 통과");
            filterChain.doFilter(request, response);
            return;
        }
        if (request.getRequestURI().startsWith("/ws-chat")) {
            System.out.println("🐿️ /ws-chat 요청 JWT 필터 통과");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = resolveToken(request);
            // 로그아웃된 토큰인지 확인
            if (token != null & tokenBlacklistService.isBlackListed(token)) {
                throw new SecurityException("로그아웃된 토큰입니다");
            }
            // 2. validateToken 으로 토큰 유효성 검사
            if (token != null && jwtProvider.validateToken(token)) {
                // 토큰이 유효할 경우 토큰에서 Authentication 객체를 가지고 와서 SecurityContext 에 저장
                Authentication authentication = jwtProvider.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (SecurityException e) {
            throw new SecurityException();
        } catch (MalformedJwtException e) {
            throw new MalformedJwtException(e.getMessage());
        } catch (ExpiredJwtException e) {
            throw new ExpiredJwtException(e.getHeader(), e.getClaims(), e.getMessage());
        }
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer")) {
            return bearerToken.substring(7);
        }
        return null;
    }

}
