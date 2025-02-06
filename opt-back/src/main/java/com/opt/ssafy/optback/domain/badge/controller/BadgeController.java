package com.opt.ssafy.optback.domain.badge.controller;

import com.opt.ssafy.optback.domain.badge.dto.BadgeResponse;
import com.opt.ssafy.optback.domain.badge.entity.Badge;
import com.opt.ssafy.optback.domain.badge.service.BadgeService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/badges")
public class BadgeController {

    private final BadgeService badgeService;

    // badge 테이블에 있는 badge 목록 조회
    @GetMapping
    public ResponseEntity<List<BadgeResponse>> getBadges() {
        List<Badge> badges = badgeService.findAllBadges();
        List<BadgeResponse> badgeResponses = new ArrayList<>();
        for (Badge badge : badges) {
            badgeResponses.add(new BadgeResponse(badge));
        }
        return ResponseEntity.ok(badgeResponses);
    }

}
