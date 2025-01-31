package com.opt.ssafy.optback.domain.follow.api;

import com.opt.ssafy.optback.domain.follow.application.FollowService;
import com.opt.ssafy.optback.domain.follow.dto.FollowDto;
import com.opt.ssafy.optback.domain.follow.entity.Follow;
import com.opt.ssafy.optback.domain.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/follows")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @GetMapping("/following")
    public ResponseEntity<List<FollowDto>> getFollowing() {
        return ResponseEntity.ok(followService.getFollowingList().stream()
                .map(FollowDto::fromEntity)
                .toList());
    }

    @GetMapping("/follower")
    public ResponseEntity<List<FollowDto>> getFollower() {
        return ResponseEntity.ok(followService.getFollowerList().stream()
                .map(FollowDto::fromEntity)
                .toList());
    }


    @PostMapping
    public ResponseEntity<Void> follow(@RequestParam int targetId) {
        followService.follow(targetId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{targetId}")
    public ResponseEntity<Void> unfollow(@PathVariable int targetId) {
        followService.unfollow(targetId);
        return ResponseEntity.ok().build();
    }
}
