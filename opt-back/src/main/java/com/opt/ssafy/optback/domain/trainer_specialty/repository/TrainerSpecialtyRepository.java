package com.opt.ssafy.optback.domain.trainer_specialty.repository;

import com.opt.ssafy.optback.domain.trainer_specialty.entity.TrainerSpecialty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrainerSpecialtyRepository extends JpaRepository<TrainerSpecialty, Long> {
    List<TrainerSpecialty> findByMemberId(int memberId);
}
