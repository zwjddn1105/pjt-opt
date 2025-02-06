package com.opt.ssafy.optback.domain.challenge.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChallengeRecordProgressRequest {
    private int challengeId;
    private int count;
}
