package com.opt.ssafy.optback.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@RequiredArgsConstructor
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final String ENDPOINT = "/ws-chat";
    private static final String SIMPLE_BROKER = "/topic";
    private static final String PUBLISH = "/app";

    private final JwtChannelInterceptor jwtChannelInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker(SIMPLE_BROKER);
        registry.setApplicationDestinationPrefixes(PUBLISH);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint(ENDPOINT)
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        System.out.println("🟢 [WebSocket] JwtChannelInterceptor 등록됨");
        registration.interceptors(jwtChannelInterceptor);
    }
//    private final JwtChannelInterceptor jwtChannelInterceptor;
//    private final ChatPreHandler chatPreHandler;
//
//    @Override
//    public void registerStompEndpoints(StompEndpointRegistry registry) {
//        registry.addEndpoint("/ws")
//                .setAllowedOriginPatterns("*")
//                .withSockJS();
//    }
//
//    @Override
//    public void configureMessageBroker(MessageBrokerRegistry registry) {
//        registry.enableSimpleBroker("/topic");  // ✅ "/topic"을 구독하는 클라이언트에게 메시지 전달
//        registry.setApplicationDestinationPrefixes("/app");  // ✅ 클라이언트가 메시지를 보낼 경로
//    }
//
//    @Override
//    public void configureClientInboundChannel(ChannelRegistration registration) {
//        System.out.println("🟢 [WebSocket] JwtChannelInterceptor 등록됨");
//        registration.interceptors(jwtChannelInterceptor);
//    }

}
