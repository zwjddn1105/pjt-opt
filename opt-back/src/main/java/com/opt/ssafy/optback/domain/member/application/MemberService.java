package com.opt.ssafy.optback.domain.member.application;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.member.dto.UpdateInterestRequest;
import com.opt.ssafy.optback.domain.member.dto.UpdateIntroRequest;
import com.opt.ssafy.optback.domain.member.dto.UpdateNicknameRequest;
import com.opt.ssafy.optback.domain.member.entity.Interest;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.member.entity.MemberInterest;
import com.opt.ssafy.optback.domain.member.exception.DuplicatedNicknameException;
import com.opt.ssafy.optback.domain.member.repository.InterestRepository;
import com.opt.ssafy.optback.domain.member.repository.MemberRepository;
import com.opt.ssafy.optback.domain.trainer_detail.entity.TrainerDetail;
import com.opt.ssafy.optback.global.application.S3Service;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {

    private final UserDetailsServiceImpl userDetailsService;
    private final MemberRepository memberRepository;
    private final InterestRepository interestRepository;
    private final S3Service s3Service;

    @Value("${profile.image.bucket.name}")
    private String profileImageBucketName;

    public void updateIntro(UpdateIntroRequest request) {
        Member member = userDetailsService.getMemberByContextHolder();
        TrainerDetail trainerDetail = member.getTrainerDetail();
        trainerDetail.updateIntro(request.getContent());
    }

    public void updateNickname(UpdateNicknameRequest request) {
        Member member = userDetailsService.getMemberByContextHolder();
        if (memberRepository.existsByNickname(request.getNickname())) {
            throw new DuplicatedNicknameException();
        }
        member.updateNickname(request.getNickname());
    }

    public void updateProfileImage(MultipartFile image) {
        try {
            String imagePath = s3Service.uploadImageFile(image, profileImageBucketName);
            Member member = userDetailsService.getMemberByContextHolder();
            member.updateProfileImage(imagePath);
        } catch (IOException e) {
            System.err.println("업로드 실패 : " + e.getMessage());
        }
    }

    public void updateInterests(UpdateInterestRequest request) {
        Member member = userDetailsService.getMemberByContextHolder();
        List<Interest> interests = interestRepository.findAllById(request.getInterestIds());

        List<MemberInterest> newInterests = interests.stream().map(interest ->
                MemberInterest.builder()
                        .member(member)
                        .interest(interest)
                        .build()).toList();
        member.updateInterests(newInterests);
    }

}
