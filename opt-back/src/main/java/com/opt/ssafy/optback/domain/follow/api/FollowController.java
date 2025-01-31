package com.opt.ssafy.optback.domain.follow.api;

import com.opt.ssafy.optback.domain.follow.application.FollowService;
import com.opt.ssafy.optback.domain.follow.dto.FollowDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/follows")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @GetMapping("/following")
    public List<FollowDto> getFollowingList(@RequestParam Long memberId) {
        return followService.getFollowingList(memberId);
    }

    @GetMapping("/follower")
    public List<FollowDto> getFollowerList(@RequestParam Long memberId) {
        return followService.getFollowerList(memberId);
    }

    @PostMapping
    public void addFollow(@RequestBody FollowDto followDto) {
        followService.addFollow(followDto);
    }

    @DeleteMapping("/{followId}")
    public void removeFollow(@PathVariable Long followId) {
        followService.removeFollow(followId);
    }
}
