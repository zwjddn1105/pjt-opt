package com.opt.ssafy.optback.domain.auth.application;

import com.opt.ssafy.optback.domain.auth.dto.SignInRequest;
import com.opt.ssafy.optback.domain.auth.dto.SignInResponse;
import com.opt.ssafy.optback.domain.auth.dto.SignUpRequest;
import com.opt.ssafy.optback.domain.auth.exception.DuplicatedSignUpException;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.member.exception.MemberNotFoundException;
import com.opt.ssafy.optback.domain.member.repository.MemberRepository;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    public final MemberRepository memberRepository;
    private final JwtProvider jwtProvider;

    public void signUp(SignUpRequest signUpRequest) {
        try {
            Member member = Member.builder()
                    .email(signUpRequest.getEmail())
                    .build();
            memberRepository.save(member);
        } catch (DataIntegrityViolationException e) {
            throw new DuplicatedSignUpException();
        }
    }

    public SignInResponse signIn(SignInRequest request) {
        Authentication authentication = authenticate(request);
        String accessToken = jwtProvider.generateAccessToken(authentication);
        String refreshToken = jwtProvider.generateRefreshToken(authentication);
        Member member = memberRepository.findByEmail(request.getEmail()).orElseThrow(MemberNotFoundException::new);
        return SignInResponse.from(member, accessToken, refreshToken);
    }

    private Authentication authenticate(SignInRequest request) {
        User user = new User(request.getEmail(), "", Collections.singletonList(new SimpleGrantedAuthority("USER")));
        return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
    }

}
