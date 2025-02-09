package com.opt.ssafy.optback.global.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class KafkaConsumerService {

    @KafkaListener(topics = "business_license_response", groupId = "spring-group")
    public void consume(String message) {
        log.info("Received JSON response from Kafka: {}", message);

        // JSON 문자열을 Java 객체로 변환 (Jackson 사용)
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            log.info("Parsed JSON: {}", jsonNode.toPrettyString());
        } catch (Exception e) {
            log.error("Error parsing JSON: {}", e.getMessage());
        }
    }
}
