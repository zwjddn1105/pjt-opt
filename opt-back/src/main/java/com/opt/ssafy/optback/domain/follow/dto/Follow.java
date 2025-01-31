package com.opt.ssafy.optback.domain.follow.dto;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "follow")
public class Follow {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "follower_id")
    private Long followerId;

    @Column(name = "following_id")
    private Long followingId;

    public void setId(Long id) {
        this.id = id;
    }

    public void setFollowerId(Long followerId) {
        this.followerId = followerId;
    }

    public void setFollowingId(Long followingId) {
        this.followingId = followingId;
    }
}
