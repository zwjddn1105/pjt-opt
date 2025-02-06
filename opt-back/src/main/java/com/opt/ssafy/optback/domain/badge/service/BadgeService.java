package com.opt.ssafy.optback.domain.badge.service;

import com.opt.ssafy.optback.domain.badge.dto.ActivityType;
import com.opt.ssafy.optback.domain.badge.entity.Badge;
import com.opt.ssafy.optback.domain.badge.entity.BadgeDefinition;
import com.opt.ssafy.optback.domain.badge.entity.MemberBadge;
import com.opt.ssafy.optback.domain.badge.evaluator.BadgeEvaluator;
import com.opt.ssafy.optback.domain.badge.exception.BadgeEvaluatorException;
import com.opt.ssafy.optback.domain.badge.repository.BadgeDefinitionRepository;
import com.opt.ssafy.optback.domain.badge.repository.BadgeRepository;
import com.opt.ssafy.optback.domain.badge.repository.MemberBadgeRepository;
import com.opt.ssafy.optback.domain.member.entity.Member;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BadgeService {

    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final MemberBadgeRepository memberBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final Map<ActivityType, BadgeEvaluator> evaluators;

    public BadgeService(List<BadgeEvaluator> evaluatorList, BadgeDefinitionRepository badgeDefinitionRepository,
                        MemberBadgeRepository memberBadgeRepository, BadgeRepository badgeRepository) {
        System.out.println("뱃지 평가기 주입 개수" + evaluatorList.size());
        evaluatorList.forEach(evaluator -> System.out.println("등록된 평가기" + evaluator.getType()));
        this.evaluators = evaluatorList.stream()
                .collect(Collectors.toMap(BadgeEvaluator::getType, Function.identity()));
        this.badgeDefinitionRepository = badgeDefinitionRepository;
        this.memberBadgeRepository = memberBadgeRepository;
        this.badgeRepository = badgeRepository;
    }

    public List<Badge> findAllBadges() {
        return badgeRepository.findAll();
    }

    public boolean hasBadge(Member member, int badgeId) {
        return memberBadgeRepository.existsByMemberIdAndBadgeId(member.getId(), badgeId);
    }

    @Transactional
    public void checkAndSaveBadges(Member member, ActivityType activityType) {
        List<BadgeDefinition> badgeDefinitions = badgeDefinitionRepository.findByActivityType(activityType);

        for (BadgeDefinition definition : badgeDefinitions) {
            System.out.println("뱃지 체크" + definition.getActivityType());
            System.out.println("🔎 등록된 평가기 목록: ");
            evaluators.forEach(
                    (key, value) -> System.out.println("👉 키: " + key + " / 평가기: " + value.getClass().getSimpleName()));

            if (hasBadge(member, definition.getId())) {
                System.out.println("⏩ 이미 보유한 뱃지: " + definition.getId());
                continue;
            }

            // getType을 통해 사용할 평가기 선택
            BadgeEvaluator evaluator = evaluators.values().stream()
                    .filter(e -> e.getType() == definition.getActivityType())
                    .findFirst()
                    .orElse(null);

            if (evaluator == null) {
                System.out.println("❌ 뱃지 평가기 찾을 수 없음: " + definition.getActivityType());
                throw new BadgeEvaluatorException("뱃지 평가기를 찾지 못하였습니다");
            }

            if (evaluator.evaluate(member, definition.getCondition())) {
                saveBadge(member, definition);
            }
        }
    }

    @Transactional
    public void saveBadge(Member member, BadgeDefinition badgeDefinition) {
        Badge badge = badgeRepository.findById(badgeDefinition.getBadgeId())
                .orElseThrow(() -> new BadgeEvaluatorException("뱃지를 찾을 수 없습니다"));

        MemberBadge memberBadge = MemberBadge.create(member, badge);
        memberBadgeRepository.save(memberBadge);

        System.out.println("✅ 업적 획득! " + member.getId() + "번 ID 멤버가" + badge.getId() + "번 업적을 획득했습니다");
    }

}
