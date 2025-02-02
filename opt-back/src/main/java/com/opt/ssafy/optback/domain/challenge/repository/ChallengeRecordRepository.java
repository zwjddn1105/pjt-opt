package com.opt.ssafy.optback.domain.challenge.repository;

import com.opt.ssafy.optback.domain.challenge.entity.ChallengeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChallengeRecordRepository extends JpaRepository<ChallengeRecord, Integer> {
}
