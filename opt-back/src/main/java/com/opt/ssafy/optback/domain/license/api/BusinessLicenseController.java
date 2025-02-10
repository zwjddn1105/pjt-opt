package com.opt.ssafy.optback.domain.license.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.global.application.S3Service;
import com.opt.ssafy.optback.global.dto.SuccessResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${business.license.bucket.name}")
    private String bucketName;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserDetailsServiceImpl userDetailsService;
    private final ObjectMapper objectMapper;
    private final S3Service s3Service;

    @PostMapping("/business")
    public ResponseEntity<SuccessResponse> abc(@RequestPart(name = "image") MultipartFile image) throws IOException {
        String path = s3Service.uploadImageFile(image, bucketName);
        Map<String, Object> message = new HashMap<>();
        message.put("path", path);
        message.put("id", userDetailsService.getMemberByContextHolder().getId());

        log.info("메시지 전송");
        String jsonMessage = objectMapper.writeValueAsString(message);
        kafkaTemplate.send("business_license_request", jsonMessage);
        log.info("메시지 전송 완료");

        return ResponseEntity.ok(SuccessResponse.builder()
                .message("잠시만 기다리세용")
                .build());
    }
}
