package com.opt.ssafy.optback.domain.auth.api;

import com.opt.ssafy.optback.domain.auth.application.AuthService;
import com.opt.ssafy.optback.domain.auth.dto.SignInResponse;
import com.opt.ssafy.optback.domain.auth.dto.SignUpRequest;
import com.opt.ssafy.optback.domain.member.repository.MemberRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final MemberRepository memberRepository;

    @PostMapping("/sign-up")
    public void signUp(@RequestBody SignUpRequest signUpRequest) {
        authService.signUp(signUpRequest);
    }

    @PostMapping("/sign-in")
    public ResponseEntity<SignInResponse> signIn(@RequestBody SignInRequest signInRequest) {
        SignInResponse signInResponse = authService.signIn(signInRequest);
        return ResponseEntity.ok(signInResponse);
    }

    // 로그인(회원가입)
    @GetMapping("/kakao")
    public ResponseEntity<SignInResponse> kakaoLogin(@RequestParam("code") String accessCode,
                                                     HttpServletResponse httpServletResponse) {
        System.out.println("🐿️ 컨트롤러 토큰확인 :" + accessCode);
        SignInResponse signInResponse = authService.kakaoLogin(accessCode, httpServletResponse);
        return ResponseEntity.ok(signInResponse);
    }

    // 로그아웃
    @PostMapping("/sign-out")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token,
                                         @RequestParam String email) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("유효하지 않은 토큰 형식입니다");
        }
        String accessToken = token.substring(7);
        System.out.println("🐿️ 로그아웃 요청 시 받은 토큰: " + accessToken);
        authService.logout(email, accessToken);

        return ResponseEntity.ok("로그아웃 성공");
    }

    @DeleteMapping("/withdraw")
    public ResponseEntity<String> withdraw(@RequestHeader("Authorization") String token, @RequestParam String email) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("유효하지 않은 토큰입니다");
        }
        String accessToken = token.substring(7);
        System.out.println("🐿️ 회원 탈퇴 시 요청 받은 토큰:" + accessToken);
        authService.deleteMember(email, accessToken);
        return ResponseEntity.ok("회원 탈퇴 완료");
    }
}
