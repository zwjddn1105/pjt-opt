package com.opt.ssafy.optback.domain.trainer_specialty.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class KeywordExtractor {

    // 외부 AI 키워드 추출 API의 URL
    private static final String API_URL = "https://api.your-ai-keyword-extraction.com/extract";

    // ObjectMapper는 재사용하는 것이 좋습니다.
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static List<KeywordResult> extractKeywords(String text) {
        List<KeywordResult> results = new ArrayList<>();

        // API 키는 환경변수 등에서 읽어옵니다.
        String apiKey = System.getenv("AI_KEYWORD_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("AI 키워드 추출 API 키가 설정되어 있지 않습니다.");
        }

        // 요청 페이로드 구성 (예: {"text": "입력 텍스트"})
        Map<String, String> payload = new HashMap<>();
        payload.put("text", text);

        String requestBody;
        try {
            requestBody = objectMapper.writeValueAsString(payload);
        } catch (IOException e) {
            throw new RuntimeException("JSON 요청 페이로드 생성 실패", e);
        }

        // HttpClient 생성 (Java 11 이상)
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)  // API 인증 헤더 (Bearer 토큰 예시)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        try {
            // 동기식으로 API 호출
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                // 응답 JSON 파싱
                JsonNode root = objectMapper.readTree(response.body());
                if (root.has("keywords") && root.get("keywords").isArray()) {
                    ArrayNode keywordsArray = (ArrayNode) root.get("keywords");
                    for (JsonNode node : keywordsArray) {
                        String keyword = node.get("keyword").asText();
                        // API에서 similarityScore가 문자열로 전달되었다고 가정 (숫자 또는 문자열에 따라 변환)
                        BigDecimal similarityScore = new BigDecimal(node.get("similarityScore").asText())
                                .setScale(2, RoundingMode.HALF_UP);
                        results.add(new KeywordResult(keyword, similarityScore));
                    }
                } else {
                    throw new RuntimeException("응답에 'keywords' 필드가 없습니다.");
                }
            } else {
                throw new RuntimeException("AI 키워드 추출 API 호출 실패, 상태 코드: " + response.statusCode());
            }
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("AI 키워드 추출 API 호출 중 예외 발생", e);
        }

        return results;
    }
}
