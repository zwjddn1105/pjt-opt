package com.opt.ssafy.optback.domain.trainer_specialty.repository;

import com.opt.ssafy.optback.domain.trainer_specialty.entity.TrainerDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrainerDetailRepository extends JpaRepository<TrainerDetail, Long> {
    Optional<TrainerDetail> findByMemberId(int memberId);
}
