package com.opt.ssafy.optback.global.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opt.ssafy.optback.config.ChatGPTConfig;
import com.opt.ssafy.optback.global.dto.GptRequest;
import com.opt.ssafy.optback.global.exception.GPTException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GPTService {

    private final ChatGPTConfig chatGPTConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openai.model}")
    private String model;

    @Value("${openai.api.url}")
    private String openaiApiUrl;

    // 프롬프트 생성
    public List<Map<String, Object>> prompt(GptRequest gptRequest) {
        // 헤더 구성
        HttpHeaders headers = chatGPTConfig.headers();

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", gptRequest.getPrompt());
        messages.add(userMessage);

        // 요청 본문
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.8f);

        // 본문 JSON 문자열로 변환
        String jsonRequestBody;
        try {
            jsonRequestBody = objectMapper.writeValueAsString(requestBody);
        } catch (JsonProcessingException e) {
            throw new GPTException("GPT 요청 본문이 잘못 되었습니다");
        }

        HttpEntity<String> requestEntity = new HttpEntity<>(jsonRequestBody, headers);

        ResponseEntity<String> responseEntity = chatGPTConfig.restTemplate()
                .exchange(
                        openaiApiUrl,
                        HttpMethod.POST,
                        requestEntity,
                        String.class
                );

        if (!responseEntity.getStatusCode().is2xxSuccessful()) {
            throw new GPTException("GPT 호출 실패");
        }

        String responseBody = responseEntity.getBody();

        List<Map<String, Object>> result = new ArrayList<>();
        try {
            Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            for (Map<String, Object> choice : choices) {
                Map<String, Object> message = (Map<String, Object>) choice.get("message");
                String content = (String) message.get("content");
                Map<String, Object> nutritionMap = objectMapper.readValue(content, Map.class);
                result.add(nutritionMap);
            }
        } catch (Exception e) {
            throw new GPTException("응답 변환 실패");
        }
        return result;
    }
}
