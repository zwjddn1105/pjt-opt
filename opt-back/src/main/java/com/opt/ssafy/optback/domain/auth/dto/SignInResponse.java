package com.opt.ssafy.optback.domain.auth.dto;

import com.opt.ssafy.optback.domain.member.entity.Member;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SignInResponse {
    private Integer id;
    private String role;
    private String accessToken;
    private String refreshToken;
    private String nickname;
    private String email;

    public static SignInResponse from(Member member, String accessToken, String refreshToken) {
        return SignInResponse.builder()
                .id(member.getId())
                .role(member.getRole().name())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .nickname(member.getNickname())
                .email(member.getEmail())
                .build();
    }
}
