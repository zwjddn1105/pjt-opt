package com.opt.ssafy.optback.domain.badge.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ActivityType {


    EXERCISE("운동"),
    ATTENDANCE("출석");

    private final String displayName;
}
