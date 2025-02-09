package com.opt.ssafy.optback.domain.license;

import com.opt.ssafy.optback.global.dto.SuccessResponse;
import java.io.IOException;
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


    private final KafkaTemplate<String, byte[]> kafkaTemplate;

    @PostMapping("/business")
    public ResponseEntity<SuccessResponse> abc(@RequestPart(name = "image") MultipartFile image) throws IOException {
        // 이미지 파일을 바이트 배열로 변환
        byte[] fileBytes = image.getBytes();

        System.out.println("메시지 전송");
        // Kafka에 메시지 전송 (Topic: "business_license_request")
        kafkaTemplate.send("business_license_request", fileBytes);
        System.out.println("메시지 전송 완료");
        // 즉시 응답 반환 (비동기 처리)
        return ResponseEntity.ok(SuccessResponse.builder().build());
    }
}
