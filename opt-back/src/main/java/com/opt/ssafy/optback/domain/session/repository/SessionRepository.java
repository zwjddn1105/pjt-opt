package com.opt.ssafy.optback.domain.session.repository;

import com.opt.ssafy.optback.domain.session.entity.Session;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionRepository extends JpaRepository<Session, Integer> {
    List<Session> findByTicketTrainerId(int id);

    List<Session> findByTicketStudentId(int id);
    // 필요에 따라 추가 커스텀 메서드 선언
}
