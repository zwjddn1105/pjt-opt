package com.opt.ssafy.optback.domain.badge.evaluator;


import com.opt.ssafy.optback.domain.member.entity.Member;
import java.util.Map;

public class ChallengeEvaluator implements BadgeEvaluator {

    @Override
    public boolean evaluate(Member member, Map<String, Object> condition) {
        return false;
    }

    @Override
    public String getType() {
        return "챌린지";
    }
}
