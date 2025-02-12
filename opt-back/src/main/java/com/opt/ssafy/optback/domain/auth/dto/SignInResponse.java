package com.opt.ssafy.optback.domain.auth.dto;

import com.opt.ssafy.optback.domain.member.entity.Member;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SignInResponse {
    private String role;
    private String accessToken;
    private String refreshToken;
    private String nickname;

    public static SignInResponse from(Member member, String accessToken, String refreshToken) {
        return SignInResponse.builder()
                .role(member.getRole().name())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .nickname(member.getNickname())
                .build();
    }
}
