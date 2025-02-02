package com.opt.ssafy.optback.domain.challenge.repository;

import com.opt.ssafy.optback.domain.challenge.entity.ChallengeMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChallengeMemberRepository extends JpaRepository<ChallengeMember, Integer> {
    Optional<ChallengeMember> findByChallengeIdAndMemberId(int challengeId, int memberId);
}
