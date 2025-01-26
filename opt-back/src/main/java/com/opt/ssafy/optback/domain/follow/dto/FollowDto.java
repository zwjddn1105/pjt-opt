package com.opt.ssafy.optback.domain.follow.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class FollowDto {

    // Getters and Setters
    private Long followerId;
    private Long followingId;

    public FollowDto(Long followerId, Long followingId) {
        this.followerId = followerId;
        this.followingId = followingId;
    }

}
