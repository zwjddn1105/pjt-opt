package com.opt.ssafy.optback.domain.session.repository;

import com.opt.ssafy.optback.domain.session.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionRepository extends JpaRepository<Session, Integer> {
    // 필요에 따라 추가 커스텀 메서드 선언
}
