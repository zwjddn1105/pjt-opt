package com.opt.ssafy.optback.domain.badge.service;

import com.opt.ssafy.optback.domain.badge.entity.BadgeDefinition;
import com.opt.ssafy.optback.domain.badge.entity.MemberBadge;
import com.opt.ssafy.optback.domain.badge.evaluator.BadgeEvaluator;
import com.opt.ssafy.optback.domain.badge.exception.BadgeEvaluatorException;
import com.opt.ssafy.optback.domain.badge.repository.BadgeDefinitionRepository;
import com.opt.ssafy.optback.domain.member.entity.Member;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class BadgeService {

    private final Map<String, BadgeEvaluator> evaluators;

    public BadgeService(List<BadgeEvaluator> evaluators) {
        this.evaluators = evaluators.stream()
                .collect(Collectors.toMap(BadgeEvaluator::getType, Function.identity()));

    }

    public List<MemberBadge> checkAndSaveBadges(Member member) {
        List<MemberBadge> savedBadges = new ArrayList<>();

        for (BadgeDefinition definition : BadgeDefinitionRepository.getBadgeDefinitions()) {

            // 평가기 선택
            BadgeEvaluator evaluator = evaluators.get(definition.getType());

            if (evaluator == null) {
                throw new BadgeEvaluatorException("뱃지 평가기를 찾지 못하였습니다");
            }

            if (evaluator.evaluate(member, definition.getCondition())) {
                int id = definition.getId();
                savedBadges.add(MemberBadge.builder().badgeId(id).member(member).build());
            }
        }

        return savedBadges;
    }

}
