package com.opt.ssafy.optback.domain.badge.event;

import com.opt.ssafy.optback.domain.badge.dto.ActivityType;
import com.opt.ssafy.optback.domain.badge.entity.BadgeDefinition;
import com.opt.ssafy.optback.domain.badge.exception.BadgeEvaluatorException;
import com.opt.ssafy.optback.domain.badge.repository.BadgeDefinitionRepository;
import com.opt.ssafy.optback.domain.badge.service.BadgeService;
import com.opt.ssafy.optback.domain.member.entity.Member;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BadgeEventListener {

    private final BadgeService badgeService;
    private final BadgeDefinitionRepository badgeDefinitionRepository;

    @Async
    @EventListener
    public void activeEvent(ActivityEvent event) {
        Member member = event.getMember();
        ActivityType activityType = event.getActivityType();
        System.out.println("📢 이벤트 리스너 실행: Member ID = " + event.getMember().getId() + ", ActivityType = "
                + event.getActivityType());

        List<BadgeDefinition> relatedBadges = badgeDefinitionRepository.getBadgeDefinitionsByType(activityType);
        System.out.println("✅ 해당 event와 연관된 뱃지 갯수" + relatedBadges.size());
        if (relatedBadges.isEmpty()) {
            throw new BadgeEvaluatorException("해당 activityType과 관련된 업적이 없습니다");
        }

        for (BadgeDefinition badge : relatedBadges) {
            System.out.println("✅ 체크할 badgeID" + badge.getBadgeId());
            badgeService.checkAndSaveBadges(member, activityType);
        }

    }

}
