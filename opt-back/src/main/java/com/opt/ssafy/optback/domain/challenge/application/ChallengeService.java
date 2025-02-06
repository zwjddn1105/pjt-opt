package com.opt.ssafy.optback.domain.challenge.application;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.challenge.dto.ChallengeRecordResponse;
import com.opt.ssafy.optback.domain.challenge.dto.ChallengeResponse;
import com.opt.ssafy.optback.domain.challenge.dto.CreateChallengeRequest;
import com.opt.ssafy.optback.domain.challenge.dto.JoinChallengeRequest;
import com.opt.ssafy.optback.domain.challenge.entity.Challenge;
import com.opt.ssafy.optback.domain.challenge.entity.ChallengeMember;
import com.opt.ssafy.optback.domain.challenge.entity.ChallengeRecord;
import com.opt.ssafy.optback.domain.challenge.exception.ChallengeNotFoundException;
import com.opt.ssafy.optback.domain.challenge.exception.ChallengeRecordNotFoundException;
import com.opt.ssafy.optback.domain.challenge.repository.ChallengeMemberRepository;
import com.opt.ssafy.optback.domain.challenge.repository.ChallengeRecordRepository;
import com.opt.ssafy.optback.domain.challenge.repository.ChallengeRepository;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.member.repository.MemberRepository;
import jakarta.transaction.Transactional;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeRecordRepository challengeRecordRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final MemberRepository memberRepository;

    // 기존 전체 챌린지 조회
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

    // 챌린지 생성 (host_id는 인증된 사용자의 id로 처리)
    public void createChallenge(CreateChallengeRequest request) {
        Member host = userDetailsService.getMemberByContextHolder();
        Challenge challenge = Challenge.builder()
                .type(request.getType())
                .title(request.getTitle())
                .description(request.getDescription())
                .reward(request.getReward())
                .templateId(request.getTemplate_id())
                .hostId(host.getId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .currentParticipants(0)
                .status(request.getStatus())
                .maxParticipants(request.getMax_participants())
                .frequency(request.getFrequency())
                .progress(0F)
                .imagePath(request.getImagePath())
                .exerciseType(request.getExercise_type())
                .exerciseCount(request.getExercise_count())
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
    public void recordChallenge(int memberId, int challengeId, int count) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ChallengeNotFoundException("Challenge not found with id: " + challengeId));

        // 사용자가 해당 챌린지에 참여 중인지 확인
        ChallengeMember challengeMember = challengeMemberRepository
                .findByChallengeIdAndMemberId(challengeId, memberId)
                .orElseThrow(() -> new IllegalStateException(
                        "User is not joined in the challenge. Please join the challenge first."));

        Date today = new Date(); // 오늘 날짜

        // 기존 기록이 있는지 확인
        Optional<ChallengeRecord> existingRecord = challengeRecordRepository.findByChallengeMemberAndCreatedAt(
                challengeMember, today);

        if (existingRecord.isPresent()) {
            ChallengeRecord record = existingRecord.get();

            // 기존 count보다 큰 경우 업데이트
            if (count > record.getCount()) {
                record.setCount(count);

                // 이미 is_passed가 true이면 변경하지 않음 (성능 최적화)
                if (!record.isPassed() && count >= challenge.getExerciseCount()) {
                    record.setIsPassed();
                }

                challengeRecordRepository.save(record);
            }
        } else {
            // 기존 기록이 없다면 새로운 기록 추가
            boolean isPassed = count >= challenge.getExerciseCount(); // 초기 is_passed 값 결정

            ChallengeRecord newRecord = ChallengeRecord.builder()
                    .challenge(challenge)
                    .challengeMember(challengeMember)
                    .memberId(challengeMember.getMemberId())
                    .count(count)
                    .createdAt(today)
                    .isPassed(isPassed)
                    .build();

            challengeRecordRepository.save(newRecord);
        }
    }

    //챌린지 기록 조회
    public List<ChallengeRecordResponse> getChallengeRecords(int memberId) {
        List<ChallengeRecord> records = challengeRecordRepository.findByMemberId(memberId);

        if (records.isEmpty()) {
            throw new ChallengeRecordNotFoundException("No challenge records found for the user.");
        }

        return records.stream()
                .map(ChallengeRecordResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ChallengeRecordResponse getChallengeRecord(int memberId, int challengeId) {
        ChallengeRecord record = challengeRecordRepository
                .findByMemberIdAndChallengeId(memberId, challengeId)
                .orElseThrow(() -> new ChallengeRecordNotFoundException(
                        "No record found for challengeId: " + challengeId));

        return ChallengeRecordResponse.fromEntity(record);
    }

    // 챌린지 참여
    public void joinChallenge(JoinChallengeRequest request) {
        Member member = userDetailsService.getMemberByContextHolder();
        Challenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ChallengeNotFoundException(
                        "Challenge not found with id: " + request.getChallengeId()));

        boolean isAlreadyJoined = challengeMemberRepository.existsByChallengeIdAndMemberId(challenge.getId(),
                member.getId());

        if (isAlreadyJoined) {
            throw new IllegalStateException("User has already joined this challenge.");
        }

        if (!challenge.getStatus().equals("OPEN")) {
            throw new IllegalStateException("Challenge has not been opened.");
        }

        increaseParticipants(request.getChallengeId());

        ChallengeMember challengeMember = ChallengeMember.builder()
                .challengeId(challenge.getId())
                .memberId(member.getId())
                .status("JOINED")
                .joinAt(new Date())
                .build();
        challengeMemberRepository.save(challengeMember);
    }

    // 챌린지 탈퇴
    @Transactional
    public void leaveChallenge(int challengeId) {
        Member member = userDetailsService.getMemberByContextHolder();

        // 챌린지 멤버 확인
        ChallengeMember challengeMember = challengeMemberRepository
                .findByChallengeIdAndMemberId(challengeId, member.getId())
                .orElseThrow(() -> new IllegalStateException("User is not joined in this challenge."));

        // 챌린지 상태 확인
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalStateException("Challenge not found."));

        if ("PROGRESS".equals(challenge.getStatus())) {
            throw new IllegalStateException("Cannot leave a challenge that is in progress.");
        }

        decreaseParticipants(challengeId);

        challengeMemberRepository.deleteByChallengeIdAndMemberId(challengeId, member.getId());
    }

    public void increaseParticipants(int challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ChallengeNotFoundException("Challenge not found"));

        if (challenge.getCurrentParticipants() >= challenge.getMaxParticipants()) {
            throw new IllegalStateException("Maximum participants reached.");
        }

        challenge.setCurrentParticipants(challenge.getCurrentParticipants() + 1);
        challengeRepository.save(challenge);
    }

    public void decreaseParticipants(int challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ChallengeNotFoundException("Challenge not found"));

        if (challenge.getCurrentParticipants() <= 0) {
            throw new IllegalStateException("No participants to remove.");
        }

        challenge.setCurrentParticipants(challenge.getCurrentParticipants() - 1);
        challengeRepository.save(challenge);
    }

    // [추가] 내(트레이너)가 생성한 챌린지 목록
    public List<ChallengeResponse> getCreatedChallenges() {
        Member member = userDetailsService.getMemberByContextHolder();
        List<Challenge> challenges = challengeRepository.findByHostId(member.getId());
        return challenges.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // [추가] 내가 참여중인 챌린지 목록: challenge_member.status == "JOINED"
    public List<ChallengeResponse> getParticipatingChallenges() {
        Member member = userDetailsService.getMemberByContextHolder();
        List<Integer> challengeIds = challengeMemberRepository.findChallengeIdsByMemberIdAndStatus(member.getId(),
                "JOINED");
        List<Challenge> challenges = challengeRepository.findByIdIn(challengeIds);
        return challenges.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // [추가] 내가 신청한 챌린지 목록 (예: status가 "APPLIED")
    public List<ChallengeResponse> getAppliedChallenges() {
        Member member = userDetailsService.getMemberByContextHolder();
        List<Integer> challengeIds = challengeMemberRepository.findChallengeIdsByMemberIdAndStatus(member.getId(),
                "APPLIED");
        List<Challenge> challenges = challengeRepository.findByIdIn(challengeIds);
        return challenges.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // [추가] 내가 참여했던 챌린지 목록: challenge_member.status == "END"
    public List<ChallengeResponse> getPastChallenges() {
        Member member = userDetailsService.getMemberByContextHolder();
        List<Integer> challengeIds = challengeMemberRepository.findChallengeIdsByMemberIdAndStatus(member.getId(),
                "END");
        List<Challenge> challenges = challengeRepository.findByIdIn(challengeIds);
        return challenges.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    // [추가] 진행중인 챌린지 (전체, 날짜 조건: start_date ≤ 오늘 ≤ end_date)
    public List<ChallengeResponse> getOngoingChallenges() {
        Date now = new Date();
        List<Challenge> challenges = challengeRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqual(now,
                now);
        return challenges.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // [추가] 종료된 챌린지 (전체, 날짜 조건: end_date < 오늘)
    public List<ChallengeResponse> getEndedChallenges() {
        Date now = new Date();
        List<Challenge> challenges = challengeRepository.findByEndDateLessThan(now);
        return challenges.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // [추가] 개최예정인 챌린지 (전체, 날짜 조건: start_date > 오늘)
    public List<ChallengeResponse> getUpcomingChallenges() {
        Date now = new Date();
        List<Challenge> challenges = challengeRepository.findByStartDateGreaterThan(now);
        return challenges.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Scheduled(cron = "10 0 0 * * *")
    @Transactional
    public void updateChallengeAndMember() { //challenge 테이블과 challenge_member 수정
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE, -1); // 하루 전 날짜
        Date targetDate = cal.getTime();

        log.info("챌린지 우승자 선정 스케줄러 실행 ({})", targetDate);

        // 오늘(end_date) 종료되는 챌린지 조회
        List<Challenge> endingChallenges = challengeRepository.findByEndDate(targetDate);

        for (Challenge challenge : endingChallenges) {
            log.info("종료된 챌린지 ID: {}", challenge.getId());

            // 해당 챌린지에 참여한 멤버 조회
            List<ChallengeMember> members = challengeMemberRepository.findByChallengeId(challenge.getId());

            challenge.setStatus("END");

            if (members.isEmpty()) {
                log.info("챌린지 {}에 참가한 멤버가 없습니다.", challenge.getId());
                challengeRepository.save(challenge);
                continue;
            }

            for (ChallengeMember member : members) {
                member.setStatus("ENDED");
            }
            challengeMemberRepository.saveAll(members);

            // 가장 높은 count를 기록한 멤버 찾기
            int winnerId = findWinner(members);

            // winnerId가 있을 경우 챌린지 업데이트
            if (winnerId != -1) {
                challenge.setWinner(winnerId);
                log.info("챌린지 {} 우승자: Member ID {}", challenge.getId(), winnerId);
            }
            challengeRepository.save(challenge);
        }
    }

    @Scheduled(cron = "10 0 0 * * *")
    public void updateProgress() {
        List<Challenge> challenges = challengeRepository.findAll();

        for (Challenge challenge : challenges) {
            // TEAM 타입 챌린지만 업데이트
            if (!"TEAM".equals(challenge.getType()) || "END".equals(challenge.getStatus())) {
                return;
            }

            List<ChallengeMember> members = challengeMemberRepository.findByChallengeId(challenge.getId());

            // 참여한 멤버들의 count 합산
            int totalCount = members.stream()
                    .map(member -> challengeRecordRepository.sumCountByMemberIdAndChallengeId(member.getMemberId(),
                            challenge.getId()).orElse(0))
                    .reduce(0, Integer::sum);

            // progress 계산 (exercise_count가 0이면 0 처리)
            float progress = ((float) totalCount / challenge.getExerciseCount()) * 100;
            ;
            if (challenge.getExerciseCount() <= 0) {
                progress = 0.0f;
            }

            if (progress > 100) {
                progress = 100.0f;
            }

            challenge.setProgress(progress);
            challengeRepository.save(challenge);

            log.info("챌린지 {}의 progress가 {}로 업데이트됨.", challenge.getId(), progress);
        }
    }

    // 가장 높은 count를 기록한 멤버 찾기
    private int findWinner(List<ChallengeMember> members) {
        int maxCount = 0;
        int winnerId = -1;

        for (ChallengeMember member : members) {
            Optional<Integer> count = challengeRecordRepository.findCountByChallengeMemberId(member.getId());

            if (count.isPresent() && count.get() > maxCount) {
                maxCount = count.get();
                winnerId = member.getMemberId();
            }
        }
        return winnerId;
    }


    // 엔티티 → DTO 매핑
    private ChallengeResponse mapToResponse(Challenge challenge) {
        return ChallengeResponse.builder()
                .id(challenge.getId())
                .type(challenge.getType())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .reward(challenge.getReward())
                .templateId(challenge.getTemplateId())
                .hostId(challenge.getHostId())
                .startDate(challenge.getStartDate())
                .endDate(challenge.getEndDate())
                .createdAt(challenge.getCreatedAt())
                .status(challenge.getStatus())
                .currentParticipants(challenge.getCurrentParticipants())
                .maxParticipants(challenge.getMaxParticipants())
                .frequency(challenge.getFrequency())
                .imagePath(challenge.getImagePath())
                .progress(challenge.getProgress())
                .exerciseType(challenge.getExerciseType())
                .exerciseCount(challenge.getExerciseCount())
                .build();
    }
}
