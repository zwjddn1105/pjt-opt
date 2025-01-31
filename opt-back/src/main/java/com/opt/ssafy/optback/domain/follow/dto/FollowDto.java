package com.opt.ssafy.optback.domain.follow.dto;

import com.opt.ssafy.optback.domain.follow.entity.Follow;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.member.entity.MemberInterest;
import com.opt.ssafy.optback.domain.member.entity.Interest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@AllArgsConstructor
public class FollowDto {
    private int id;
    private int memberId;
    private String name;
    private String nickname;
    private String imagePath;
    private String role;
    private boolean isOnboarded;
    private boolean isDeleted;
    private List<String> memberInterests;
    private Object trainerDetail;
    private List<String> favoriteExercises;

    public static FollowDto fromEntity(Follow follow) {
        Member member = follow.getTarget();
        return FollowDto.builder()
                .id(follow.getId())
                .memberId(member.getId())
                .name(member.getName())
                .nickname(member.getNickname())
                .imagePath(member.getImagePath())
                .role(member.getRole().name())
                .isOnboarded(member.isOnboarded())
                .isDeleted(member.isDeleted())
                .memberInterests(member.getMemberInterests().stream()
                        .map(memberInterest -> memberInterest != null && memberInterest.getInterest() != null
                                ? memberInterest.getInterest().getDisplayName()
                                : "Unknown")
                        .collect(Collectors.toList()))
                .trainerDetail(member.getTrainerDetail())
                .favoriteExercises(member.getFavoriteExercises().stream()
                        .map(favoriteExercise -> favoriteExercise.getExercise().getName()) // Exercise의 이름만 반환
                        .collect(Collectors.toList()))
                .build();
    }
}

