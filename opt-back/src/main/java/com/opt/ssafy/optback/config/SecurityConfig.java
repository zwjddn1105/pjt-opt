package com.opt.ssafy.optback.config;

import com.opt.ssafy.optback.domain.auth.application.JwtProvider;
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
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable()).authorizeHttpRequests((auth) -> {
                            auth.requestMatchers("/auth/sign-in").permitAll();
                            auth.requestMatchers("/auth/sign-up").permitAll();
                            auth.requestMatchers("/error").permitAll();
                            auth.anyRequest().authenticated();
                        }
                ).addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new AuthExceptionHandlerFilter(), JwtAuthenticationFilter.class);
        http.exceptionHandling(manager -> manager.authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                .accessDeniedHandler(new AccessDeniedHandlerImpl()));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

