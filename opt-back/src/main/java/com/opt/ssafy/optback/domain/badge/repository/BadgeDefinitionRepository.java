package com.opt.ssafy.optback.domain.badge.repository;

import com.opt.ssafy.optback.domain.badge.dto.ActivityType;
import com.opt.ssafy.optback.domain.badge.entity.BadgeDefinition;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class BadgeDefinitionRepository {

    private final Map<ActivityType, List<BadgeDefinition>> badgeDefinitionMap = new HashMap<>();

    public BadgeDefinitionRepository() {
        badgeDefinitionMap.put(ActivityType.EXERCISE, new ArrayList<>(List.of(
                new BadgeDefinition(1, 1, ActivityType.EXERCISE, Map.of("exerciseId", 1, "targetCount", 10))
        )));

        badgeDefinitionMap.put(ActivityType.ATTENDANCE, new ArrayList<>(List.of(
                new BadgeDefinition(2, 2, ActivityType.ATTENDANCE, Map.of("targetDays", 1))
        )));
    }

    public List<BadgeDefinition> getBadgeDefinitionsByType(ActivityType activityType) {
        return badgeDefinitionMap.getOrDefault(activityType, Collections.emptyList());
    }

    public List<BadgeDefinition> getBadgeDefinitions() {
        return badgeDefinitionMap.values().stream()
                .flatMap(List::stream)
                .toList();
    }

    public Optional<BadgeDefinition> findById(int id) {
        return badgeDefinitionMap.values().stream()
                .flatMap(List::stream)
                .filter(badge -> badge.getId() == id)
                .findFirst();
    }

    public List<BadgeDefinition> findByActivityType(ActivityType activityType) {
        List<BadgeDefinition> definitions = getBadgeDefinitionsByType(activityType);
        System.out.println("📝 조회된 뱃지 목록 (" + activityType + "): " + definitions.size() + "개");
        definitions.forEach(def -> System.out.println("✅ 뱃지 ID: " + def.getId() + " / 조건: " + def.getCondition()));
        return definitions;
    }
}
