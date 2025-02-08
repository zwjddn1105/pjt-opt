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
                .orElseThrow(() -> new ChallengeNotFoundException("존재하지 않는 챌린지 입니다. with id: " + id));
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
            throw new ChallengeNotFoundException("존재하지 않는 챌린지 입니다. with id: " + id);
        }
        challengeRepository.deleteById(id);
    }

    // 챌린지 수행 기록
    public void recordChallenge(int memberId, int challengeId, Integer count, Integer duration, Integer distance) {
        // 챌린지 정보 조회
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ChallengeNotFoundException("챌린지를 찾을 수 없습니다."));

        // 무조건 하나의 값만 NOT NULL이므로, 해당하는 기록 메서드만 호출
        if (challenge.getExerciseCount() != null) {
            recordCount(memberId, challengeId, count);
        } else if (challenge.getExerciseDistance() != null) {
            recordDistance(memberId, challengeId, distance);
        } else if (challenge.getExerciseDuration() != null) {
            recordDuration(memberId, challengeId, duration);
        }
    }

    @Transactional
    public void recordCount(int memberId, int challengeId, Integer count) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ChallengeNotFoundException("존재하지 않는 챌린지 입니다. with id: " + challengeId));

        ChallengeMember challengeMember = challengeMemberRepository
                .findByChallengeIdAndMemberId(challengeId, memberId)
                .orElseThrow(() -> new IllegalStateException("아직 챌린지에 참여하지 않은 사용자 입니다. 먼저 챌린지에 참여해주세요."));

        Date today = new Date(); // 오늘 날짜

        Optional<ChallengeRecord> existingRecord = challengeRecordRepository.findByChallengeMemberAndCreatedAt(
                challengeMember, today);

        if (existingRecord.isPresent()) {
            ChallengeRecord record = existingRecord.get();
            if (count > record.getCount()) {
                record.setCount(count);
            }
            updateIsPassed(record, challenge);
            challengeRecordRepository.save(record);
        } else {
            boolean isPassed = checkIsPassed(count, null, null, challenge);
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

        updateCountProgress(challenge);
    }


    public void recordDistance(int memberId, int challengeId, Integer distance) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ChallengeNotFoundException("존재하지 않는 챌린지 입니다. with id: " + challengeId));

        ChallengeMember challengeMember = challengeMemberRepository
                .findByChallengeIdAndMemberId(challengeId, memberId)
                .orElseThrow(() -> new IllegalStateException("아직 챌린지에 참여하지 않은 사용자 입니다. 먼저 챌린지에 참여해주세요."));

        Date today = new Date();

        Optional<ChallengeRecord> existingRecord = challengeRecordRepository.findByChallengeMemberAndCreatedAt(
                challengeMember, today);

        if (existingRecord.isPresent()) {
            ChallengeRecord record = existingRecord.get();
            Integer newDistance = record.getDistance()+distance;

            record.setDistance(newDistance);

            updateIsPassed(record, challenge);
            challengeRecordRepository.save(record);
        } else {
            boolean isPassed = checkIsPassed(null, null, distance, challenge);
            ChallengeRecord newRecord = ChallengeRecord.builder()
                    .challenge(challenge)
                    .challengeMember(challengeMember)
                    .memberId(challengeMember.getMemberId())
                    .distance(distance)
                    .createdAt(today)
                    .isPassed(isPassed)
                    .build();
            challengeRecordRepository.save(newRecord);
        }

        updateDistanceProgress(challenge);
    }


    public void recordDuration(int memberId, int challengeId, Integer duration) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ChallengeNotFoundException("존재하지 않는 챌린지 입니다. with id: " + challengeId));

        ChallengeMember challengeMember = challengeMemberRepository
                .findByChallengeIdAndMemberId(challengeId, memberId)
                .orElseThrow(() -> new IllegalStateException("아직 챌린지에 참여하지 않은 사용자 입니다. 먼저 챌린지에 참여해주세요."));

        Date today = new Date(); // 오늘 날짜

        Optional<ChallengeRecord> existingRecord = challengeRecordRepository.findByChallengeMemberAndCreatedAt(
                challengeMember, today);

        if (existingRecord.isPresent()) {
            ChallengeRecord record = existingRecord.get();
            if (duration > record.getDuration()) {
                record.setDuration(duration);
            }
            updateIsPassed(record, challenge);
            challengeRecordRepository.save(record);
        } else {
            boolean isPassed = checkIsPassed(null, duration, null, challenge);
            ChallengeRecord newRecord = ChallengeRecord.builder()
                    .challenge(challenge)
                    .challengeMember(challengeMember)
                    .memberId(challengeMember.getMemberId())
                    .duration(duration)
                    .createdAt(today)
                    .isPassed(isPassed)
                    .build();
            challengeRecordRepository.save(newRecord);
        }

        updateDurationProgress(challenge);
    }


    // 기존의 챌린지 기록을 업데이트할 때, is_passed를 판정하는 함수
    private void updateIsPassed(ChallengeRecord record, Challenge challenge) {
        if ("TEAM".equals(challenge.getType()) && challenge.getProgress() >= 100F) {
            setAllTeamMembersPassed(challenge.getId());
        } else if (record.getCount() != null && challenge.getExerciseCount() != null
                && record.getCount() >= challenge.getExerciseCount()) {
            record.setIsPassed();
        } else if (record.getDuration() != null && challenge.getExerciseDuration() != null
                && record.getDuration() >= challenge.getExerciseDuration()) {
            record.setIsPassed();
        } else if (record.getDistance() != null && challenge.getExerciseDistance() != null
                && record.getDistance().compareTo(challenge.getExerciseDistance()) >= 0) {
            record.setIsPassed();
        }
    }


    // 챌린지 기록을 새로 생성할 때, is_passed를 판정하는 함수
    private boolean checkIsPassed(Integer count, Integer duration, Integer distance, Challenge challenge) {
        if ("TEAM".equals(challenge.getType())) {
            return challenge.getProgress() >= 100F;
        } else if (count != null && challenge.getExerciseCount() != null && count >= challenge.getExerciseCount()) {
            return true;
        } else if (duration != null && challenge.getExerciseDuration() != null && duration >= challenge.getExerciseDuration()) {
            return true;
        } else if (distance != null && challenge.getExerciseDistance() != null && distance >= challenge.getExerciseDistance()) {
            return true;
        }
        return false;
    }

    public void updateCountProgress(Challenge challenge) {
        List<ChallengeMember> members = challengeMemberRepository.findByChallengeId(challenge.getId());

        // 참여한 멤버들의 count 합산
        int totalCount = members.stream()
                .map(member -> challengeRecordRepository.sumCountByMemberIdAndChallengeId(member.getMemberId(),
                        challenge.getId()).orElse(0))
                .reduce(0, Integer::sum);

        // progress 계산
        float progress = (challenge.getExerciseCount() > 0)
                ? Math.round(((float) totalCount / challenge.getExerciseCount()) * 100)
                : 0.0f;

        // progress가 100을 초과하지 않도록 제한
        if (progress > 100) {
            progress = 100.0f;
        }

        challenge.setProgress(progress);
        challengeRepository.save(challenge);

        log.info("챌린지 {}의 progress가 {}로 업데이트됨.", challenge.getId(), progress);
    }

    public void updateDurationProgress(Challenge challenge) {
        List<ChallengeMember> members = challengeMemberRepository.findByChallengeId(challenge.getId());

        // 참여한 멤버들의 duration 합산
        int totalDuration = members.stream()
                .map(member -> challengeRecordRepository.sumDurationByMemberIdAndChallengeId(member.getMemberId(),
                        challenge.getId()).orElse(0))
                .reduce(0, Integer::sum);

        // progress 계산
        float progress = (challenge.getExerciseDuration() > 0)
                ? Math.round(((float) totalDuration / challenge.getExerciseDuration()) * 100)
                : 0.0f;

        // progress가 100을 초과하지 않도록 제한
        if (progress > 100) {
            progress = 100.0f;
        }

        challenge.setProgress(progress);
        challengeRepository.save(challenge);

        log.info("챌린지 {}의 progress (duration 기준) {}로 업데이트됨.", challenge.getId(), progress);
    }

    public void updateDistanceProgress(Challenge challenge) {
        List<ChallengeMember> members = challengeMemberRepository.findByChallengeId(challenge.getId());

        // 참여한 멤버들의 distance 합산
        int totalDistance = members.stream()
                .map(member -> challengeRecordRepository.sumDistanceByMemberIdAndChallengeId(member.getMemberId(),
                        challenge.getId()).orElse(0))
                .reduce(0, Integer::sum);

        // progress 계산
        float progress = (challenge.getExerciseDistance() > 0)
                ? Math.min(((float) totalDistance / challenge.getExerciseDistance()) * 100, 100.0f)
                : 0.0f;

        challenge.setProgress(progress);
        challengeRepository.save(challenge);

        log.info("챌린지 {}의 progress (distance 기준) {}로 업데이트됨.", challenge.getId(), progress);
    }


    private void setAllTeamMembersPassed(int challengeId) {
        List<ChallengeRecord> teamRecords = challengeRecordRepository.findByChallengeId(challengeId);

        for (ChallengeRecord record : teamRecords) {
            if (!record.isPassed()) { // 이미 true인 경우는 제외
                record.setIsPassed();
            }
        }

        challengeRecordRepository.saveAll(teamRecords);
        log.info("챌린지 {}의 모든 멤버 isPassed = true", challengeId);
    }

    //챌린지 기록 조회
    public List<ChallengeRecordResponse> getChallengeRecords(int memberId) {
        List<ChallengeRecord> records = challengeRecordRepository.findByMemberId(memberId);

        if (records.isEmpty()) {
            throw new ChallengeRecordNotFoundException("현재 유저의 챌린지 기록이 존재하지 않습니다.");
        }

        return records.stream()
                .map(ChallengeRecordResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ChallengeRecordResponse getChallengeRecord(int memberId, int challengeId) {
        ChallengeRecord record = challengeRecordRepository
                .findByMemberIdAndChallengeId(memberId, challengeId)
                .orElseThrow(() -> new ChallengeRecordNotFoundException(
                        "challengeId: " + challengeId+"에 대한 챌린지 기록을 찾을 수 없습니다."));

        return ChallengeRecordResponse.fromEntity(record);
    }

    // 챌린지 참여
    public void joinChallenge(JoinChallengeRequest request) {
        Member member = userDetailsService.getMemberByContextHolder();
        Challenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ChallengeNotFoundException(
                        "id: " + request.getChallengeId()+"인 챌린지를 찾을 수 없습니다."));

        boolean isAlreadyJoined = challengeMemberRepository.existsByChallengeIdAndMemberId(challenge.getId(),
                member.getId());

        if (isAlreadyJoined) {
            throw new IllegalStateException("이미 챌린지에 지원한 유저입니다.");
        }

        if (challenge.getStatus().equals("PROGRESS")) {
            throw new IllegalStateException("챌린지가 이미 진행 중입니다. 참여할 수 없습니다.");
        }
        if (challenge.getStatus().equals("END")) {
            throw new IllegalStateException("종료된 챌린지 입니다. 참여할 수 없습니다.");
        }

        increaseParticipants(request.getChallengeId());

        ChallengeMember challengeMember = ChallengeMember.builder()
                .challengeId(challenge.getId())
                .memberId(member.getId())
                .status("APPLIED")
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
                .orElseThrow(() -> new IllegalStateException("챌린지에 참여하지 않은 사용자입니다."));

        // 챌린지 상태 확인
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 챌린지입니다."));

        if ("PROGRESS".equals(challenge.getStatus())) {
            throw new IllegalStateException("진행 중인 챌린지는 탈퇴할 수 없습니다.");
        }

        decreaseParticipants(challengeId);

        challengeMemberRepository.deleteByChallengeIdAndMemberId(challengeId, member.getId());
    }

    public void increaseParticipants(int challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ChallengeNotFoundException("존재하지 않는 챌린지 입니다."));

        if (challenge.getCurrentParticipants() >= challenge.getMaxParticipants()) {
            throw new IllegalStateException("최대 인원 수에 도달했습니다.");
        }

        challenge.setCurrentParticipants(challenge.getCurrentParticipants() + 1);
        challengeRepository.save(challenge);
    }

    public void decreaseParticipants(int challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ChallengeNotFoundException("존재하지 않는 챌린지 입니다."));

        if (challenge.getCurrentParticipants() <= 0) {
            throw new IllegalStateException("No participants to remove.");
        }

        challenge.setCurrentParticipants(challenge.getCurrentParticipants() - 1);
        challengeRepository.save(challenge);
    }

    // 내(트레이너)가 생성한 챌린지 목록
    public List<ChallengeResponse> getCreatedChallenges() {
        Member member = userDetailsService.getMemberByContextHolder();
        List<Challenge> challenges = challengeRepository.findByHostId(member.getId());
        return challenges.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 내가 참여중인 챌린지 목록: challenge_member.status == "JOINED"
    public List<ChallengeResponse> getParticipatingChallenges() {
        Member member = userDetailsService.getMemberByContextHolder();
        List<Integer> challengeIds = challengeMemberRepository.findChallengeIdsByMemberIdAndStatus(member.getId(),
                "JOINED");
        List<Challenge> challenges = challengeRepository.findByIdIn(challengeIds);
        return challenges.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 내가 신청한 챌린지 목록 (예: status가 "APPLIED")
    public List<ChallengeResponse> getAppliedChallenges() {
        Member member = userDetailsService.getMemberByContextHolder();
        List<Integer> challengeIds = challengeMemberRepository.findChallengeIdsByMemberIdAndStatus(member.getId(),
                "APPLIED");
        List<Challenge> challenges = challengeRepository.findByIdIn(challengeIds);
        return challenges.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // 내가 참여했던 챌린지 목록: challenge_member.status == "END"
    public List<ChallengeResponse> getPastChallenges() {
        Member member = userDetailsService.getMemberByContextHolder();
        List<Integer> challengeIds = challengeMemberRepository.findChallengeIdsByMemberIdAndStatus(member.getId(),
                "END");
        List<Challenge> challenges = challengeRepository.findByIdIn(challengeIds);
        return challenges.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    // 진행중인 챌린지 (전체, 날짜 조건: start_date ≤ 오늘 ≤ end_date)
    public List<ChallengeResponse> getOngoingChallenges() {
        Date now = new Date();
        List<Challenge> challenges = challengeRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqual(now,
                now);
        return challenges.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // 종료된 챌린지 (전체, 날짜 조건: end_date < 오늘)
    public List<ChallengeResponse> getEndedChallenges() {
        Date now = new Date();
        List<Challenge> challenges = challengeRepository.findByEndDateLessThan(now);
        return challenges.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // 개최예정인 챌린지 (전체, 날짜 조건: start_date > 오늘)
    public List<ChallengeResponse> getUpcomingChallenges() {
        Date now = new Date();
        List<Challenge> challenges = challengeRepository.findByStartDateGreaterThan(now);
        return challenges.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Scheduled(cron = "10 0 0 * * *")
    @Transactional
    public void updateChallengeAndMember() {
        Calendar cal = Calendar.getInstance();

        // 하루 전 날짜 계산 (start_date 기준)
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -1);
        Date startTargetDate = cal.getTime();

        // 하루 전 날짜 계산 (end_date 기준)
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -1);
        Date endTargetDate = cal.getTime();

        log.info("챌린지 상태 변경 스케줄러 실행 (start_date 기준: {}, end_date 기준: {})", startTargetDate, endTargetDate);

        // start_date가 오늘보다 하루 전인 챌린지를 PROGRESS 상태로 변경
        List<Challenge> startingChallenges = challengeRepository.findByStartDateAndStatus(startTargetDate, "OPEN");

        for (Challenge challenge : startingChallenges) {
            log.info("진행 시작된 챌린지 ID: {}", challenge.getId());
            List<ChallengeMember> members = challengeMemberRepository.findByChallengeId(challenge.getId());
            challenge.setStatus("PROGRESS");

            if (members.isEmpty()) {
                log.info("챌린지 {}에 참가한 멤버가 없습니다.", challenge.getId());
                challengeRepository.save(challenge);
                continue;
            }

            for (ChallengeMember member : members) {
                member.setStatus("JOINED");
            }
            challengeMemberRepository.saveAll(members);
            challengeRepository.save(challenge);
        }

        // end_date가 오늘보다 하루 전인 챌린지를 ENDED 상태로 변경
        List<Challenge> endingChallenges = challengeRepository.findByEndDateAndStatus(endTargetDate, "PROGRESS");

        for (Challenge challenge : endingChallenges) {
            log.info("종료된 챌린지 ID: {}", challenge.getId());

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

            // 가장 높은 count, duration, distance를 기록한 멤버 찾기
            int winnerId = findWinner(challenge, members);

            if (winnerId != -1) {
                challenge.setWinner(winnerId);
                log.info("챌린지 {} 우승자: Member ID {}", challenge.getId(), winnerId);
            }
            challengeRepository.save(challenge);
        }
    }

    // 가장 높은 count, duration, distance를 기록한 멤버 찾기
    private int findWinner(Challenge challenge, List<ChallengeMember> members) {
        int winnerId = -1;

        // 각 기준의 최댓값 저장
        int maxCount = 0;
        int maxDuration = 0;
        int maxDistance = 0;

        for (ChallengeMember member : members) {
            int count = challengeRecordRepository.findCountByChallengeMemberId(member.getId()).orElse(0);
            int duration = challengeRecordRepository.findDurationByChallengeMemberId(member.getId()).orElse(0);
            int distance = challengeRecordRepository.findDistanceByChallengeMemberId(member.getId()).orElse(0);

            if (challenge.getExerciseCount() != null && count > maxCount) {
                maxCount = count;
                winnerId = member.getMemberId();
            }

            if (challenge.getExerciseDuration() != null && duration > maxDuration) {
                maxDuration = duration;
                winnerId = member.getMemberId();
            }

            if (challenge.getExerciseDistance() != null && distance > maxDistance) {
                maxDistance = distance;
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
