package com.opt.ssafy.optback.domain.exercise.repository;

import com.opt.ssafy.optback.domain.exercise.entity.ExerciseRecord;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExerciseRecordRepository extends JpaRepository<ExerciseRecord, Integer> {

    List<ExerciseRecord> findByMemberIdAndCreatedAtBetween(int memberId, LocalDate createdAtAfter,
                                                           LocalDate createdAtBefore);

}
