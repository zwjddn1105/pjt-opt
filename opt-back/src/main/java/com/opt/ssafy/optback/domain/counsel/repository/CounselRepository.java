package com.opt.ssafy.optback.domain.counsel.repository;

import com.opt.ssafy.optback.domain.counsel.entity.Counsel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CounselRepository extends JpaRepository<Counsel, Integer> {
    // 추가 검색 조건이 필요하면 여기서 메서드를 선언할 수 있음.
}
