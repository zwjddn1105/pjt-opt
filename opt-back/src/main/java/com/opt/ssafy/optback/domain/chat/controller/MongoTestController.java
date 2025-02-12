package com.opt.ssafy.optback.domain.chat.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mongo")
@RequiredArgsConstructor
public class MongoTestController {

    private final MongoTemplate mongoTemplate;

    @GetMapping("/check")
    public ResponseEntity<String> checkMongoConnection() {
        try {
            mongoTemplate.getDb().getName(); // 연결 확인
            return ResponseEntity.ok("🐤 MongoDB 연결 성공!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("🚫 MongoDB 연결 실패: " + e.getMessage());
        }
    }
}