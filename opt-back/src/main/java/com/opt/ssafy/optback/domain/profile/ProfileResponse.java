package com.opt.ssafy.optback.domain.profile;

import com.opt.ssafy.optback.domain.badge.dto.BadgeResponse;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Getter
public class ProfileResponse {
    private String role;
    private Integer id;
    private String imagePath;
    private String nickname;
    private BadgeResponse mainBadge;
}
