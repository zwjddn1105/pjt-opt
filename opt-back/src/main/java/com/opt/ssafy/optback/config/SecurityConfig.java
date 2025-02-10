package com.opt.ssafy.optback.config;

import com.opt.ssafy.optback.domain.auth.application.JwtProvider;
import com.opt.ssafy.optback.domain.auth.application.TokenBlacklistService;
import com.opt.ssafy.optback.domain.auth.filter.AuthExceptionHandlerFilter;
import com.opt.ssafy.optback.domain.auth.filter.CustomAuthenticationEntryPoint;
import com.opt.ssafy.optback.domain.auth.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtProvider jwtProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {
        http.csrf(csrf -> csrf.disable()).authorizeHttpRequests((auth) -> {
                            auth.requestMatchers("/auth/sign-in").permitAll();
                            auth.requestMatchers("/auth/sign-up").permitAll();
                            auth.requestMatchers("/exercises").permitAll();
                            auth.requestMatchers("/exercises/{id}").permitAll();
                            auth.requestMatchers("/error").permitAll();
                            auth.requestMatchers("/auth/kakao").permitAll();
                            auth.requestMatchers("/auth/sign-out").permitAll();
                            auth.requestMatchers("/auth/withdraw").permitAll();
                            auth.anyRequest().authenticated();
                        }
                ).addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new AuthExceptionHandlerFilter(), JwtAuthenticationFilter.class);
        http.exceptionHandling(manager -> manager.authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                .accessDeniedHandler(new AccessDeniedHandlerImpl()));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtProvider jwtProvider,
                                                           TokenBlacklistService tokenBlacklistService) {
        return new JwtAuthenticationFilter(jwtProvider, tokenBlacklistService);
    }
}

