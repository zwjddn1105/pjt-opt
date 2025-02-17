package com.opt.ssafy.optback.domain.follow.dto;

import com.opt.ssafy.optback.domain.follow.entity.Follow;
import com.opt.ssafy.optback.domain.member.entity.Member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@AllArgsConstructor
public class FollowResponse {
    private int id;
    private int memberId;
    private String name;
    private String nickname;
    private String imagePath;
    private String role;

    public static FollowResponse fromEntity(Follow follow) {
        Member member = follow.getTarget();
        return FollowResponse.builder()
                .id(follow.getId())
                .memberId(member.getId())
                .name(member.getName())
                .nickname(member.getNickname())
                .imagePath(member.getImagePath())
                .role(member.getRole().name())
                .build();
    }
}

