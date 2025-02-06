package com.opt.ssafy.optback.domain.challenge.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChallengeRecordRequest {
    private int challengeId;
    private int count;
}
