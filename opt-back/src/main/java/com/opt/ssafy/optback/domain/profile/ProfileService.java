package com.opt.ssafy.optback.domain.profile;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.badge.entity.Badge;
import com.opt.ssafy.optback.domain.badge.repository.BadgeRepository;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.member.exception.MemberNotFoundException;
import com.opt.ssafy.optback.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final MemberRepository memberRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final BadgeRepository badgeRepository;

    public ProfileResponse getMyProfile() {
        Member member = userDetailsService.getMemberByContextHolder();
        return getProfileResponse(member);
    }

    public ProfileResponse getProfile(Integer memberId) {
        Member member = memberRepository.findById(memberId).orElseThrow(MemberNotFoundException::new);
        return getProfileResponse(member);
    }

    public ProfileResponse getProfileResponse(Member member) {
        if (member.getMainBadgeId() == null) {
            if (member.isTrainer()) {
                return TrainerProfileResponse.from(member, null);
            }
            return MemberProfileResponse.from(member, null);
        }
        Badge mainBadge = badgeRepository.findById(member.getMainBadgeId()).orElse(null);
        if (member.isTrainer()) {
            return TrainerProfileResponse.from(member, mainBadge);
        }
        return MemberProfileResponse.from(member, mainBadge);
    }

}
