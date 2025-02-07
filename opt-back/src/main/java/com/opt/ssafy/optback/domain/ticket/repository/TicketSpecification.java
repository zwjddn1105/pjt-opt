package com.opt.ssafy.optback.domain.ticket.repository;

import com.opt.ssafy.optback.domain.ticket.entity.Ticket;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public class TicketSpecification {

    public static Specification<Ticket> filterTickets(Integer studentId, Integer trainerId, Boolean isUsed) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (studentId != null) {
                predicates.add(criteriaBuilder.equal(root.get("student").get("id"), studentId));
            }

            if (trainerId != null) {
                predicates.add(criteriaBuilder.equal(root.get("trainer").get("id"), trainerId));
            }

            if (Boolean.TRUE.equals(isUsed)) {
                predicates.add(criteriaBuilder.isNotNull(root.get("lastUsedDate")));
            } else if (Boolean.FALSE.equals(isUsed)) {
                predicates.add(criteriaBuilder.isNull(root.get("lastUsedDate")));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
