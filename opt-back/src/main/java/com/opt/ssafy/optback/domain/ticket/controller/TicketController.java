package com.opt.ssafy.optback.domain.ticket.controller;

import com.opt.ssafy.optback.domain.ticket.dto.TicketRequest;
import com.opt.ssafy.optback.domain.ticket.dto.TicketResponse;
import com.opt.ssafy.optback.domain.ticket.dto.UpdateTicketRequest;
import com.opt.ssafy.optback.domain.ticket.entity.Ticket;
import com.opt.ssafy.optback.domain.ticket.service.TicketService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getTicketsByCondition(
            @RequestParam(required = false) Integer studentId,
            @RequestParam(required = false) Integer trainerId,
            @RequestParam(required = false) Boolean isUsed
    ) {
        List<Ticket> findTickets = ticketService.getTickets(studentId, trainerId, isUsed);
        List<TicketResponse> response = findTickets.stream()
                .map(TicketResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<TicketResponse> addTicket(@RequestBody TicketRequest ticketRequest) {
        Ticket ticket = ticketService.saveTicket(ticketRequest);
        return ResponseEntity.ok(new TicketResponse(ticket));
    }

    @PatchMapping
    public ResponseEntity<TicketResponse> updateTicket(@RequestBody UpdateTicketRequest ticketRequest) {
        Ticket update = ticketService.updateTicket(ticketRequest);
        return ResponseEntity.ok(new TicketResponse(update));
    }

}
