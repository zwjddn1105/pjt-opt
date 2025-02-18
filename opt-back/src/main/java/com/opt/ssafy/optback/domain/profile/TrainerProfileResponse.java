package com.opt.ssafy.optback.domain.profile;

import com.opt.ssafy.optback.domain.badge.dto.BadgeResponse;
import com.opt.ssafy.optback.domain.badge.entity.Badge;
import com.opt.ssafy.optback.domain.member.entity.Member;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
public class TrainerProfileResponse extends ProfileResponse {
    private String name;
    private String intro;

    public static TrainerProfileResponse from(Member member, Badge mainBadge) {
        return TrainerProfileResponse.builder()
                .id(member.getId())
                .role(member.getRole().name())
                .name(member.getName())
                .intro(member.getTrainerDetail().getIntro())
                .mainBadge(mainBadge == null ? null : new BadgeResponse(mainBadge))
                .nickname(member.getNickname())
                .imagePath(member.getImagePath())
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
                .build();
    }
}
