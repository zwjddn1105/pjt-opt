package com.opt.ssafy.optback.domain.follow.application;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.follow.entity.Follow;
import com.opt.ssafy.optback.domain.follow.repository.FollowRepository;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.member.exception.MemberNotFoundException;
import com.opt.ssafy.optback.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final MemberRepository memberRepository;
    private final UserDetailsServiceImpl userDetailsService;

    @Transactional(readOnly = true)
    public List<Follow> getFollowingList() {
        Member member = userDetailsService.getMemberByContextHolder();
        return followRepository.findByMember(member);
    }

    @Transactional(readOnly = true)
    public List<Follow> getFollowerList() {
        Member member = userDetailsService.getMemberByContextHolder();
        System.out.println("@@@@@");
        return followRepository.findByTarget(member);
    }

    @Transactional
    public void follow(int targetId) {
        Member member = userDetailsService.getMemberByContextHolder();
        Member target = memberRepository.findById(targetId)
                .orElseThrow(MemberNotFoundException::new);

        // 이미 팔로우하고 있는지 체크 후 저장
        if (followRepository.findByMember(member).stream().noneMatch(f -> f.getTarget().equals(target))) {
            followRepository.save(Follow.builder().member(member).target(target).build());
        }
    }

    @Transactional
    public void unfollow(int targetId) {
        Member member = userDetailsService.getMemberByContextHolder();
        Member target = memberRepository.findById(targetId)
                .orElseThrow(MemberNotFoundException::new);

        followRepository.deleteByMemberAndTarget(member, target);
    }

}
