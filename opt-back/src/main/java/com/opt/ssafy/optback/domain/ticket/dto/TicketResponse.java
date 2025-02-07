package com.opt.ssafy.optback.domain.ticket.dto;

import com.opt.ssafy.optback.domain.ticket.entity.Ticket;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TicketResponse {

    private int id;
    private int trainerId;
    private int studentId;
    private int price;
    private int totalSessions;
    private LocalDate startDate;
    private LocalDate lastUsedDate;
    private int usedSessions;
    private String status;

    public TicketResponse(Ticket ticket) {
        this.id = ticket.getId();
        this.trainerId = ticket.getTrainer().getId();
        this.studentId = ticket.getStudent().getId();
        this.price = ticket.getPrice();
        this.totalSessions = ticket.getTotalSessions();
        this.startDate = ticket.getStartDate();
        this.lastUsedDate = ticket.getLastUsedDate();
        this.usedSessions = ticket.getUsedSessions();
        this.status = ticket.getStatus();
    }

}
