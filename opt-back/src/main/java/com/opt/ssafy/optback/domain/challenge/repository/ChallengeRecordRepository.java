package com.opt.ssafy.optback.domain.challenge.repository;

import com.opt.ssafy.optback.domain.challenge.entity.ChallengeMember;
import com.opt.ssafy.optback.domain.challenge.entity.ChallengeRecord;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChallengeRecordRepository extends JpaRepository<ChallengeRecord, Integer> {
    // 특정 멤버의 전체 수행 기록 조회
    List<ChallengeRecord> findByMemberId(int memberId);

    // 특정 멤버의 특정 챌린지 수행 기록 조회
    Optional<ChallengeRecord> findByMemberIdAndChallengeId(int memberId, int challengeId);

    // 특정 챌린지 멤버의 수행 기록 조회 (ChallengeMember 기반 조회)
    Optional<ChallengeRecord> findByChallengeMember(ChallengeMember challengeMember);

    Optional<ChallengeRecord> findByChallengeMemberAndCreatedAt(ChallengeMember challengeMember, Date today);

    @Query("SELECT c.count FROM ChallengeRecord c WHERE c.challengeMember.id = :challengeMemberId")
    Optional<Integer> findCountByChallengeMemberId(@Param("challengeMemberId") int challengeMemberId);

    @Query("SELECT SUM(c.count) FROM ChallengeRecord c WHERE c.memberId = :memberId AND c.challenge.id = :challengeId")
    Optional<Integer> sumCountByMemberIdAndChallengeId(@Param("memberId") int memberId,
                                                       @Param("challengeId") int challengeId);
}

