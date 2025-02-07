package com.opt.ssafy.optback.domain.ticket.repository;

import com.opt.ssafy.optback.domain.ticket.entity.Ticket;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer>, JpaSpecificationExecutor<Ticket> {

    List<Ticket> findByStudent_Id(int id);

    List<Ticket> findByTrainer_Id(int id);

    List<Ticket> findByLastUsedDateIsNotNull();

    List<Ticket> findByLastUsedDateIsNull();

}
