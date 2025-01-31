package com.opt.ssafy.optback.domain.follow.application;

import com.opt.ssafy.optback.domain.follow.dto.Follow;
import com.opt.ssafy.optback.domain.follow.dto.FollowDto;
import com.opt.ssafy.optback.domain.follow.dto.FollowRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowService {

    private final FollowRepository followRepository;

    public FollowService(FollowRepository followRepository) {
        this.followRepository = followRepository;
    }

    public List<FollowDto> getFollowingList(Long memberId) {
        return followRepository.findByFollowerId(memberId)
                .stream()
                .map(follow -> new FollowDto(follow.getFollowerId(), follow.getFollowingId()))
                .collect(Collectors.toList());
    }

    public List<FollowDto> getFollowerList(Long memberId) {
        return followRepository.findByFollowingId(memberId)
                .stream()
                .map(follow -> new FollowDto(follow.getFollowerId(), follow.getFollowingId()))
                .collect(Collectors.toList());
    }

    public void addFollow(FollowDto followDto) {
        Follow follow = new Follow();
        follow.setFollowerId(followDto.getFollowerId());
        follow.setFollowingId(followDto.getFollowingId());
        followRepository.save(follow);
    }

    public void removeFollow(Long followId) {
        followRepository.deleteById(followId);
    }
}
