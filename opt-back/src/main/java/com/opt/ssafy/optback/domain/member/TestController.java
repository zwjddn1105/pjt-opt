package com.opt.ssafy.optback.domain.member;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    @PreAuthorize("hasAnyRole('USER')")
    @GetMapping
    public void abc() {
        System.out.println(SecurityContextHolder.getContext().getAuthentication());
    }

}
