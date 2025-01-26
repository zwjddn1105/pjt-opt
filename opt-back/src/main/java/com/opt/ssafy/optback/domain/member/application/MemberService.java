package com.opt.ssafy.optback.domain.member.application;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.member.dto.UpdateIntroRequest;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.member.entity.TrainerDetail;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {

    private final UserDetailsServiceImpl userDetailsService;
    
    public void updateIntro(UpdateIntroRequest request) {
        Member member = userDetailsService.getMemberByContextHolder();
        TrainerDetail trainerDetail = member.getTrainerDetail();
        trainerDetail.updateIntro(request.getContent());
    }

}
