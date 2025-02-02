package com.opt.ssafy.optback.domain.challenge.repository;

import com.opt.ssafy.optback.domain.challenge.entity.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Date;
import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Integer> {
    List<Challenge> findByHostId(int hostId);

    List<Challenge> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(Date startDateIsLessThan, Date endDateIsGreaterThan);

    List<Challenge> findByEndDateLessThan(Date endDateIsLessThan);

    List<Challenge> findByStartDateGreaterThan(Date startDateIsGreaterThan);

    List<Challenge> findByIdIn(List<Integer> challengeIds);
}
