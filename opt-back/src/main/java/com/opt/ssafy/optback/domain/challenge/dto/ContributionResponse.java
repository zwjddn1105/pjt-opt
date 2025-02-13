package com.opt.ssafy.optback.domain.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ContributionResponse {
    private int memberId;
    private String nickname;
    private int count;
    private double contributionPercentage;
    private boolean isMyRecord;
}
