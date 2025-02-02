package com.opt.ssafy.optback.domain.challenge.api;

import com.opt.ssafy.optback.domain.challenge.application.ChallengeService;
import com.opt.ssafy.optback.domain.challenge.dto.ChallengeRecordRequest;
import com.opt.ssafy.optback.domain.challenge.dto.CreateChallengeRequest;
import com.opt.ssafy.optback.domain.challenge.dto.ChallengeResponse;
import com.opt.ssafy.optback.domain.challenge.dto.JoinChallengeRequest;
import com.opt.ssafy.optback.domain.challenge.dto.LeaveChallengeRequest;  // 새로 추가
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

    // GET /challenges - 챌린지 목록 불러오기
    @GetMapping
    public ResponseEntity<List<ChallengeResponse>> getChallenges() {
        List<ChallengeResponse> challenges = challengeService.getChallenges();
        return ResponseEntity.ok(challenges);
    }

    // GET /challenges/{id} - 챌린지 상세정보 불러오기
    @GetMapping("/{id}")
    public ResponseEntity<ChallengeResponse> getChallenge(@PathVariable int id) {
        ChallengeResponse challenge = challengeService.getChallengeById(id);
        return ResponseEntity.ok(challenge);
    }

    // POST /challenges - 챌린지 생성하기 (TRAINER 권한 필요)
    @PostMapping
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<SuccessResponse> createChallenge(@RequestBody CreateChallengeRequest request) {
        challengeService.createChallenge(request);
        return ResponseEntity.ok(SuccessResponse.builder()
                .message("Challenge created successfully")
                .build());
    }

    // DELETE /challenges/{id} - 챌린지 삭제하기 (TRAINER 권한 필요)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TRAINER')")
    public ResponseEntity<SuccessResponse> deleteChallenge(@PathVariable int id) {
        challengeService.deleteChallenge(id);
        return ResponseEntity.ok(SuccessResponse.builder()
                .message("Challenge deleted successfully")
                .build());
    }

    // POST /challenges/record - 챌린지 수행 기록하기 (인증된 사용자 필요)
    @PostMapping("/record")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse> recordChallenge(@RequestBody ChallengeRecordRequest request) {
        challengeService.recordChallenge(request);
        return ResponseEntity.ok(SuccessResponse.builder()
                .message("Challenge recorded successfully")
                .build());
    }

    // POST /challenges/join - 챌린지 참여하기 (인증된 사용자 필요)
    @PostMapping("/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse> joinChallenge(@RequestBody JoinChallengeRequest request) {
        challengeService.joinChallenge(request);
        return ResponseEntity.ok(SuccessResponse.builder()
                .message("Challenge joined successfully")
                .build());
    }

    // PATCH /challenges - 챌린지 탈퇴 (URL에 id를 노출하지 않고, 본문으로 전달)
    @PatchMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse> leaveChallenge(@RequestBody LeaveChallengeRequest request) {
        challengeService.leaveChallenge(request.getChallengeId());
        return ResponseEntity.ok(SuccessResponse.builder()
                .message("Challenge left successfully")
                .build());
    }
}
