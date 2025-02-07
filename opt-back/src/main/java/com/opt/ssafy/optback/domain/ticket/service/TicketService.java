package com.opt.ssafy.optback.domain.ticket.service;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.member.repository.MemberRepository;
import com.opt.ssafy.optback.domain.session.dto.SessionResponse;
import com.opt.ssafy.optback.domain.ticket.dto.TicketRequest;
import com.opt.ssafy.optback.domain.ticket.dto.UpdateTicketRequest;
import com.opt.ssafy.optback.domain.ticket.entity.Ticket;
import com.opt.ssafy.optback.domain.ticket.exception.TicketNotFoundException;
import com.opt.ssafy.optback.domain.ticket.exception.TicketNotSaveException;
import com.opt.ssafy.optback.domain.ticket.repository.TicketRepository;
import com.opt.ssafy.optback.domain.ticket.repository.TicketSpecification;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final MemberRepository memberRepository;

    // 티켓 생성
    @Transactional
    public Ticket saveTicket(TicketRequest request) {
        Member trainer = userDetailsService.getMemberByContextHolder();
        if (trainer == null) {
            throw new TicketNotSaveException("티켓 생성 중 트레이너 ID 오류 발생");
        }
        Member student = memberRepository.getReferenceById(request.getStudentId());
        Ticket newTicket = Ticket.builder()
                .trainer(trainer)
                .student(student)
                .price(request.getPrice())
                .totalSessions(request.getTotalSessions())
                .status("대기")
                .build();

        return ticketRepository.save(newTicket);
    }

    // 티켓 수정(삭제 포함)
    @Transactional
    public Ticket updateTicket(UpdateTicketRequest request) {
        Ticket findTicket = ticketRepository.getReferenceById(request.getId());
        findTicket.setNewRecord(request);
        return ticketRepository.save(findTicket);
    }

    // 티켓 조회
    public List<Ticket> getTickets(Integer studentId, Integer trainerId, Boolean isUsed) {
        Specification<Ticket> spec = TicketSpecification.filterTickets(studentId, trainerId, isUsed);
        return ticketRepository.findAll(spec);
    }

    // 세션 횟수 차감 시 업데이트
    public Ticket updateUsed(SessionResponse session) {
        System.out.println("✅ 티켓아이디" + session.getTicketId());
        Ticket findTicket = ticketRepository.getReferenceById(session.getTicketId());
        if (findTicket == null) {
            throw new TicketNotFoundException("티켓을 찾지 못하였습니다");
        }

        boolean studentUsed = session.isMemberSigned();
        System.out.println("studentUsed: " + studentUsed);
        boolean trainerUsed = session.isTrainerSigned();
        System.out.println("trainerUsed: " + trainerUsed);

        // 멤버와 트레이너 모두 체크한 경우 세션 횟수 업데이트
        if (studentUsed && trainerUsed) {
            int update = findTicket.getUsedSessions() + 1;
            findTicket.setUsedSessions(update);

            // 세션 횟수를 모두 소진했을 경우
            if (update == findTicket.getTotalSessions()) {
                LocalDate lastUsedDate =
                        (session.getEndAt() != null) ? session.getEndAt().toLocalDate() : LocalDate.now();
                findTicket.setLastUsedDate(lastUsedDate);
            }
        }

        return ticketRepository.save(findTicket);
    }

}
