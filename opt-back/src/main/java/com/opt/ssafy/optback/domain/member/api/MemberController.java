package com.opt.ssafy.optback.domain.member.api;

import com.opt.ssafy.optback.domain.member.application.MemberService;
import com.opt.ssafy.optback.domain.member.dto.UpdateIntroRequest;
import com.opt.ssafy.optback.global.dto.SuccessResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class MemberController {

    private final MemberService memberService;

    // 소개글 수정
    @PreAuthorize("hasRole('TRAINER')")
    @PatchMapping("/intro")
    public ResponseEntity<SuccessResponse> updateIntro(@RequestBody UpdateIntroRequest request) {
        memberService.updateIntro(request);
        return ResponseEntity.ok(SuccessResponse.builder()
                .message("수정되었습니다")
                .build());
    }

}
