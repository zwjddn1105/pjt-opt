package com.opt.ssafy.optback.domain.profile;

import com.opt.ssafy.optback.domain.badge.dto.BadgeResponse;
import com.opt.ssafy.optback.domain.badge.entity.Badge;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.member.entity.MemberInterest;
import com.opt.ssafy.optback.domain.trainer_detail.dto.TrainerDetailResponse;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
public class TrainerProfileResponse extends ProfileResponse {
    private String name;
    private String intro;
    private Integer gymId;

    public static TrainerProfileResponse from(Member member, BadgeResponse mainBadge, Integer gymId) {
        return TrainerProfileResponse.builder()
                .id(member.getId())
                .role(member.getRole().name())
                .name(member.getName())
                .intro(member.getTrainerDetail() != null ? member.getTrainerDetail().getIntro() : null)
                .gymId(gymId)
                .mainBadge(mainBadge) // `BadgeResponse` 타입 그대로 저장
                .nickname(member.getNickname())
                .imagePath(member.getImagePath())
                .interests(member.getMemberInterests().stream().map(MemberInterest::getInterest)
                        .collect(Collectors.toList()))
                .build();
    }

    public static TrainerProfileResponse from(Member member) {
        return TrainerProfileResponse.builder()
                .id(member.getId())
                .role(member.getRole().name())
                .name(member.getName())
                .intro(member.getTrainerDetail().getIntro())
                .nickname(member.getNickname())
                .imagePath(member.getImagePath())
                .interests(member.getMemberInterests().stream().map(MemberInterest::getInterest)
                        .collect(Collectors.toList()))
                .build();
    }
}
