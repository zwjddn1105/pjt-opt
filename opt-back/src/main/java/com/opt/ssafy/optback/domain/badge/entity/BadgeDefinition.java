package com.opt.ssafy.optback.domain.badge.entity;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BadgeDefinition {

    private int id;

    private int badgeId;

    private String type;
    
    private Map<String, Object> condition;
}
