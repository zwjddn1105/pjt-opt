package com.opt.ssafy.optback.domain.meal_record.service;

import com.opt.ssafy.optback.domain.meal_record.dto.MealNutritionDto;
import com.opt.ssafy.optback.global.application.GPTService;
import com.opt.ssafy.optback.global.dto.GptRequest;
import com.opt.ssafy.optback.global.exception.GPTException;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MealNutritionAiService {

    private final GPTService gptService;

    // AI로 이미지 분석
    public MealNutritionDto analyzeMealImage(String imagePath) {
        String prompt = "다음 식단의 이미지 URL을 참고하여 이 식단의 영양 정보를 알려주십시오. 반드시 아래와 같은 JSON 형식으로 답변해야 합니다.\n"
                + "{\"calorie\": <총 칼로리>, \"protein\": <단백질>, \"carb\": <탄수화물>, \"fat\": <지방>}\n"
                + "식단이미지 URL: " + imagePath;

        GptRequest gptRequest = GptRequest.builder()
                .prompt(prompt)
                .build();

        // GPT 호출
        List<Map<String, Object>> responseList = gptService.prompt(gptRequest);
        if (responseList == null || responseList.isEmpty()) {
            throw new GPTException("GPT가 응답이 없습니다");
        }

        Map<String, Object> nutritionMap = responseList.get(0);

        // 타입 변환
        int calorie = Integer.parseInt(nutritionMap.get("calorie").toString());
        float protein = Float.parseFloat(nutritionMap.get("protein").toString());
        float carb = Float.parseFloat(nutritionMap.get("carb").toString());
        float fat = Float.parseFloat(nutritionMap.get("fat").toString());

        MealNutritionDto nutrition = MealNutritionDto.builder()
                .calorie(calorie)
                .protein(protein)
                .carb(carb)
                .fat(fat)
                .build();

        return nutrition;
    }
}
