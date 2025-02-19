package com.opt.ssafy.optback.domain.profile;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.badge.dto.BadgeResponse;
import com.opt.ssafy.optback.domain.badge.entity.Badge;
import com.opt.ssafy.optback.domain.badge.repository.BadgeRepository;
import com.opt.ssafy.optback.domain.follow.repository.FollowRepository;
import com.opt.ssafy.optback.domain.member.entity.Interest;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.member.entity.MemberInterest;
import com.opt.ssafy.optback.domain.member.exception.MemberNotFoundException;
import com.opt.ssafy.optback.domain.member.repository.MemberRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final MemberRepository memberRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final BadgeRepository badgeRepository;
    private final FollowRepository followRepository;

    public ProfileResponse getMyProfile() {
        Member member = userDetailsService.getMemberByContextHolder();
        return getProfileResponse(member);
    }

    public ProfileResponse getProfile(Integer memberId) {
        Member targetMember = memberRepository.findById(memberId)
                .orElseThrow(MemberNotFoundException::new);

        Member currentMember = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                currentMember = userDetailsService.getMemberByContextHolder();
            }
        }

        boolean isFollow = currentMember != null && followRepository.existsByMemberAndTarget(currentMember, targetMember);

        // mainBadgeId가 설정되어 있고 memberBadges가 존재하면, 해당 배지를 찾음.
        BadgeResponse mainBadgeResponse = null;
        if (targetMember.getMainBadgeId() != null && targetMember.getMemberBadges() != null) {
            mainBadgeResponse = targetMember.getMemberBadges().stream()
                    .filter(mb -> mb.getBadge().getId() == targetMember.getMainBadgeId())
                    .findFirst()
                    .map(mb -> new BadgeResponse(mb.getBadge()))
                    .orElse(null);
        }

        List<Interest> interests = targetMember.getMemberInterests().stream()
                .map(MemberInterest::getInterest)
                .collect(Collectors.toList());

        return ProfileResponse.builder()
                .id(targetMember.getId())
                .nickname(targetMember.getNickname())
                .imagePath(targetMember.getImagePath())
                .role(targetMember.getRole().toString())
                .mainBadge(mainBadgeResponse)
                .interests(interests)
                .isFollow(isFollow)
                .build();
    }

    public ProfileResponse getProfileResponse(Member member) {
        if (member.getMainBadgeId() == null) {
            if (member.isTrainer()) {
                return TrainerProfileResponse.from(member);
            }
            return MemberProfileResponse.from(member);
        }
        Badge mainBadge = badgeRepository.findById(member.getMainBadgeId()).orElse(null);
        if (member.isTrainer()) {
            return TrainerProfileResponse.from(member, mainBadge);
        }
        return MemberProfileResponse.from(member, mainBadge);
    }

}
