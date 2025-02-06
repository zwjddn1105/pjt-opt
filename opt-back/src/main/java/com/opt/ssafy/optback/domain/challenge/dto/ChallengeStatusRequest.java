package com.opt.ssafy.optback.domain.challenge.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChallengeStatusRequest {
    private int challengeId;
    private String status; // 변경할 챌린지 상태
}
