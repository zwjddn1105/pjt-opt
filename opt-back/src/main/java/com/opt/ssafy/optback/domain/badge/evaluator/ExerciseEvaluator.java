package com.opt.ssafy.optback.domain.badge.evaluator;

import com.opt.ssafy.optback.domain.exercise.repository.ExerciseRepository;
import com.opt.ssafy.optback.domain.member.entity.Member;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExerciseEvaluator implements BadgeEvaluator {

    private final ExerciseRepository exerciseRepository;

    @Override
    public boolean evaluate(Member member, Map<String, Object> condition) {
        int exerciseId = (int) condition.get("exerciseTd");
        int targetCount = (int) condition.get("targetCount");

        // @@@@@@@@@운동 조회해서 횟수 비교해서 더 클 시 true 로직 추가@@@@@@@@@@@@@
        
        return false;
    }

    @Override
    public String getType() {
        return "운동";
    }
}
