package com.opt.ssafy.optback.domain.badge.aspect;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.badge.dto.ActivityType;
import com.opt.ssafy.optback.domain.badge.event.ActivityEvent;
import com.opt.ssafy.optback.domain.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class AchievementAspect {

    private final ApplicationEventPublisher eventPublisher;
    private final UserDetailsServiceImpl userDetailsService;

    @AfterReturning("execution(* com.opt.ssafy.optback.domain.exercise.api.ExerciseRecordController.createExerciseRecord(..))")
    public void afterExerciseRecordCreation(JoinPoint joinPoint) {
        System.out.println("📢 운동 기록 저장 감지");
        Object[] args = joinPoint.getArgs();
        Member member = userDetailsService.getMemberByContextHolder();

        // 설정한 ActivityType에 관한 뱃지만 탐색
        System.out.println("📢 이벤트 시작 Member ID = " + member.getId() + ", ActivityType = " + ActivityType.ATTENDANCE);
        eventPublisher.publishEvent(new ActivityEvent(member, ActivityType.ATTENDANCE));

        System.out.println("✅ AOP 실행 완료: " + member.getId());
    }


}
