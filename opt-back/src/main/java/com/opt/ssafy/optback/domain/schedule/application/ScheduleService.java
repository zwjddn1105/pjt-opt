package com.opt.ssafy.optback.domain.schedule.application;
//
//import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
//import com.opt.ssafy.optback.domain.counsel.entity.Counsel;
//import com.opt.ssafy.optback.domain.counsel.repository.CounselRepository;
//import com.opt.ssafy.optback.domain.member.entity.Member;
//import com.opt.ssafy.optback.domain.schedule.dto.ScheduleResponse;
//import com.opt.ssafy.optback.domain.session.entity.Session;
//import com.opt.ssafy.optback.domain.session.repository.SessionRepository;
//import java.util.List;
//import java.util.stream.Collectors;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//@Service
//@RequiredArgsConstructor
public class ScheduleService {
//
//    private final CounselRepository counselRepository;
//    private final SessionRepository sessionRepository;
//    private final UserDetailsServiceImpl userDetailsService;
//
//    @Transactional(readOnly = true)
//    public List<ScheduleResponse> getSchedules() {
//        Member member = userDetailsService.getMemberByContextHolder();
//
//        // 현재 사용자가 트레이너인지 확인
//        boolean isTrainer = member.getRole().equals("ROLE_TRAINER");
//
//        // 상담 조회 (트레이너라면 관련 상담 조회, 일반 회원이라면 본인의 상담 조회)
//        List<Counsel> counsels = isTrainer
//                ? counselRepository.findByTrainerId(member.getId())
//                : counselRepository.findByMemberId(member.getId());
//
//        // 세션 조회 (트레이너라면 관련 세션 조회, 일반 회원이라면 본인의 세션 조회)
//        List<Session> sessions = isTrainer
//                ? sessionRepository.findByTicketTrainerId(member.getId())
//                : sessionRepository.findByTicketStudentId(member.getId());
//
//        // 상담과 세션을 통합하여 ScheduleResponse로 변환
//        List<ScheduleResponse> schedules = counsels.stream()
//                .map(ScheduleResponse::fromCounsel)
//                .collect(Collectors.toList());
//
//        schedules.addAll(sessions.stream()
//                .map(ScheduleResponse::fromSession)
//                .collect(Collectors.toList()));
//
//        return schedules;
//    }
}
