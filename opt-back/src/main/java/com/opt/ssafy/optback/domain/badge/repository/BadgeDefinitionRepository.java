package com.opt.ssafy.optback.domain.badge.repository;

import com.opt.ssafy.optback.domain.badge.entity.BadgeDefinition;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class BadgeDefinitionRepository {

    // 실제로 적용될 뱃지 조건
    private static final List<BadgeDefinition> BADGE_DEFINITION_LIST = List.of(
            new BadgeDefinition(1, 1, "운동", Map.of("excerciseId", 1, "targetCount", 10)),
            new BadgeDefinition(2, 2, "출석", Map.of("targetDays", 10))
    );

    public static List<BadgeDefinition> getBadgeDefinitions() {
        return BADGE_DEFINITION_LIST;
    }

    public static Optional<BadgeDefinition> findById(int id) {
        for (BadgeDefinition badgeDefinition : BADGE_DEFINITION_LIST) {
            if (badgeDefinition.getId() == id) {
                return Optional.of(badgeDefinition);
            }
        }
        return Optional.empty();
    }
}
