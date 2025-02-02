package com.opt.ssafy.optback.domain.challenge.application;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.challenge.dto.JoinChallengeRequest;
import com.opt.ssafy.optback.domain.challenge.dto.ChallengeRecordRequest;
import com.opt.ssafy.optback.domain.challenge.dto.ChallengeResponse;
import com.opt.ssafy.optback.domain.challenge.dto.CreateChallengeRequest;
import com.opt.ssafy.optback.domain.challenge.entity.Challenge;
import com.opt.ssafy.optback.domain.challenge.entity.ChallengeRecord;
import com.opt.ssafy.optback.domain.challenge.entity.ChallengeMember;
import com.opt.ssafy.optback.domain.challenge.exception.ChallengeNotFoundException;
import com.opt.ssafy.optback.domain.challenge.repository.ChallengeMemberRepository;
import com.opt.ssafy.optback.domain.challenge.repository.ChallengeRecordRepository;
import com.opt.ssafy.optback.domain.challenge.repository.ChallengeRepository;
import com.opt.ssafy.optback.domain.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeRecordRepository challengeRecordRepository;
    private final ChallengeMemberRepository challengeMemberRepository;

    // 토큰에서 로그인한 회원 정보를 가져오는 서비스
    private final UserDetailsServiceImpl userDetailsService;

    public List<ChallengeResponse> getChallenges() {
        List<Challenge> challenges = challengeRepository.findAll();
        return challenges.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ChallengeResponse getChallengeById(int id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new ChallengeNotFoundException("Challenge not found with id: " + id));
        return mapToResponse(challenge);
    }

    public void createChallenge(CreateChallengeRequest request) {
        Challenge challenge = Challenge.builder()
                .type(request.getType())
                .title(request.getTitle())
                .description(request.getDescription())
                .reward(request.getReward())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus())
                .build();
        challengeRepository.save(challenge);
    }

    public void deleteChallenge(int id) {
        if (!challengeRepository.existsById(id)) {
            throw new ChallengeNotFoundException("Challenge not found with id: " + id);
        }
        challengeRepository.deleteById(id);
    }

    // 챌린지 수행 기록
    public void recordChallenge(ChallengeRecordRequest request) {
        Member member = userDetailsService.getMemberByContextHolder();

        Challenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ChallengeNotFoundException("Challenge not found with id: " + request.getChallengeId()));

        ChallengeMember challengeMember = challengeMemberRepository
                .findByChallengeIdAndMemberId(challenge.getId(), member.getId())
                .orElseThrow(() -> new IllegalStateException("User is not joined in the challenge. Please join the challenge first."));

        ChallengeRecord record = ChallengeRecord.builder()
                .challenge(challenge)
                .memberId(member.getId())
                .count(request.getCount())
                .createdAt(new Date())
                .isPassed(false)
                .build();
        challengeRecordRepository.save(record);
    }

    // 챌린지 참여 메서드
    public void joinChallenge(JoinChallengeRequest request) {
        Member member = userDetailsService.getMemberByContextHolder();

        Challenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ChallengeNotFoundException("Challenge not found with id: " + request.getChallengeId()));

        if (challengeMemberRepository.findByChallengeIdAndMemberId(challenge.getId(), member.getId()).isPresent()) {
            throw new IllegalStateException("User has already joined this challenge.");
        }

        ChallengeMember challengeMember = ChallengeMember.builder()
                .challengeId(challenge.getId())
                .memberId(member.getId())
                .status("JOINED")
                .joinAt(new Date())
                .build();
        challengeMemberRepository.save(challengeMember);
    }

    // 챌린지 탈퇴 메서드 (PATCH /challenges/{id})
    public void leaveChallenge(int challengeId) {
        Member member = userDetailsService.getMemberByContextHolder();

        ChallengeMember challengeMember = challengeMemberRepository
                .findByChallengeIdAndMemberId(challengeId, member.getId())
                .orElseThrow(() -> new IllegalStateException("User is not joined in the challenge."));

        challengeMember.quit();  // status를 "quit"으로 변경
        challengeMemberRepository.save(challengeMember);  // 변경사항 저장 (이미 영속성 컨텍스트에 있다면 자동 업데이트될 수 있음)
    }

    private ChallengeResponse mapToResponse(Challenge challenge) {
        return ChallengeResponse.builder()
                .id(challenge.getId())
                .type(challenge.getType())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .reward(challenge.getReward())
                .startDate(challenge.getStartDate())
                .endDate(challenge.getEndDate())
                .status(challenge.getStatus())
                .build();
    }
}
