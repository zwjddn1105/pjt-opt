package com.opt.ssafy.optback.domain.onboarding.api;

import com.opt.ssafy.optback.domain.onboarding.application.OnboardingService;
import com.opt.ssafy.optback.domain.onboarding.dto.OnboardingRequest;
import com.opt.ssafy.optback.global.dto.SuccessResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping
    public ResponseEntity<SuccessResponse> onboard(
            @RequestParam String nickname,
            @RequestParam List<Integer> interestIds) {

        OnboardingRequest request = new OnboardingRequest(nickname, interestIds);
        onboardingService.onboardMember(request);

        return ResponseEntity.ok(SuccessResponse.builder()
                .message("온보딩이 완료되었습니다.")
                .build());
    }
}
