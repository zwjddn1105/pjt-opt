package com.opt.ssafy.optback.domain.license;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.global.dto.SuccessResponse;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/license")
public class BusinessLicenseController {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserDetailsServiceImpl userDetailsService;
    private final ObjectMapper objectMapper;

    @PostMapping("/business")
    public ResponseEntity<SuccessResponse> abc(@RequestPart(name = "image") MultipartFile image) throws IOException {
        // 이미지 파일을 바이트 배열로 변환
        byte[] fileBytes = image.getBytes();
        String encodedFile = Base64.getEncoder().encodeToString(fileBytes); // Base64 인코딩

        // JSON 형식으로 메시지 구성
        Map<String, Object> message = new HashMap<>();
        message.put("file", encodedFile);
        message.put("id", userDetailsService.getMemberByContextHolder().getId());

        System.out.println("메시지 전송");
        // Kafka에 메시지 전송 (Topic: "business_license_request")
        // JSON 직렬화 후 Kafka 전송
        String jsonMessage = objectMapper.writeValueAsString(message);
        kafkaTemplate.send("business_license_request", jsonMessage);
//        kafkaTemplate.send("business_license_request", fileBytes);
        System.out.println("메시지 전송 완료");
        // 즉시 응답 반환 (비동기 처리)
        return ResponseEntity.ok(SuccessResponse.builder().build());
    }
}
