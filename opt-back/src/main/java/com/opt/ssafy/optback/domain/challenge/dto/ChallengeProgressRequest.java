package com.opt.ssafy.optback.domain.challenge.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChallengeProgressRequest {
    private int challengeId;
    private float progress;
}
