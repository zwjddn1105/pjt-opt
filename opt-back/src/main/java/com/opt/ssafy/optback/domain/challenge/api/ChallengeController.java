package com.opt.ssafy.optback.domain.challenge.api;

import com.opt.ssafy.optback.domain.challenge.application.ChallengeService;
import com.opt.ssafy.optback.domain.challenge.dto.*;
import com.opt.ssafy.optback.global.dto.SuccessResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;

    // 기존 전체 챌린지 조회
    @GetMapping
    public ResponseEntity<List<ChallengeResponse>> getChallenges() {
        return ResponseEntity.ok(challengeService.getChallenges());
    }

    // GET /challenges/{id} - 특정 챌린지 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ChallengeResponse> getChallenge(@PathVariable int id) {
        return ResponseEntity.ok(challengeService.getChallengeById(id));
    }

    // POST /challenges - 챌린지 생성 (TRAINER 전용)
    @PostMapping
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<SuccessResponse> createChallenge(@RequestBody CreateChallengeRequest request) {
        challengeService.createChallenge(request);
        return ResponseEntity.ok(SuccessResponse.builder()
                .message("Challenge created successfully")
                .build());
    }

    // DELETE /challenges/{id} - 챌린지 삭제 (TRAINER 전용)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<SuccessResponse> deleteChallenge(@PathVariable int id) {
        challengeService.deleteChallenge(id);
        return ResponseEntity.ok(SuccessResponse.builder()
                .message("Challenge deleted successfully")
                .build());
    }

    // POST /challenges/record - 챌린지 수행 기록 등록
    @PostMapping("/record")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse> recordChallenge(@RequestBody ChallengeRecordRequest request) {
        challengeService.recordChallenge(request);
        return ResponseEntity.ok(SuccessResponse.builder()
                .message("Challenge record saved successfully")
                .build());
    }

    // POST /challenges/join - 챌린지 참여
    @PostMapping("/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse> joinChallenge(@RequestBody JoinChallengeRequest request) {
        challengeService.joinChallenge(request);
        return ResponseEntity.ok(SuccessResponse.builder()
                .message("Joined challenge successfully")
                .build());
    }

    // PATCH /challenges - 챌린지 탈퇴 (ID는 Body로 전달)
    @PatchMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse> leaveChallenge(@RequestBody LeaveChallengeRequest request) {
        challengeService.leaveChallenge(request.getChallengeId());
        return ResponseEntity.ok(SuccessResponse.builder()
                .message("Left challenge successfully")
                .build());
    }

    // GET /challenges/created - 내(트레이너)가 생성한 챌린지 목록
    @GetMapping("/created")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<List<ChallengeResponse>> getCreatedChallenges() {
        return ResponseEntity.ok(challengeService.getCreatedChallenges());
    }

    // GET /challenges/participating - 내가 참여중인 챌린지 목록
    @GetMapping("/participating")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChallengeResponse>> getParticipatingChallenges() {
        return ResponseEntity.ok(challengeService.getParticipatingChallenges());
    }

    // GET /challenges/applied - 내가 신청한 챌린지 목록
    @GetMapping("/applied")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChallengeResponse>> getAppliedChallenges() {
        return ResponseEntity.ok(challengeService.getAppliedChallenges());
    }

    // GET /challenges/past - 내가 참여했던 챌린지 목록
    @GetMapping("/past")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChallengeResponse>> getPastChallenges() {
        return ResponseEntity.ok(challengeService.getPastChallenges());
    }

    // GET /challenges/ongoing - 진행중인 챌린지 목록
    @GetMapping("/ongoing")
    public ResponseEntity<List<ChallengeResponse>> getOngoingChallenges() {
        return ResponseEntity.ok(challengeService.getOngoingChallenges());
    }

    // GET /challenges/ended - 종료된 챌린지 목록
    @GetMapping("/ended")
    public ResponseEntity<List<ChallengeResponse>> getEndedChallenges() {
        return ResponseEntity.ok(challengeService.getEndedChallenges());
    }

    // GET /challenges/upcoming - 개최예정인 챌린지 목록
    @GetMapping("/upcoming")
    public ResponseEntity<List<ChallengeResponse>> getUpcomingChallenges() {
        return ResponseEntity.ok(challengeService.getUpcomingChallenges());
    }
}
