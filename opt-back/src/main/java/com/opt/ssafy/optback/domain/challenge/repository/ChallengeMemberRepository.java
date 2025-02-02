package com.opt.ssafy.optback.domain.challenge.repository;

import com.opt.ssafy.optback.domain.challenge.entity.ChallengeMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeMemberRepository extends JpaRepository<ChallengeMember, Integer> {
    Optional<ChallengeMember> findByChallengeIdAndMemberId(int challengeId, int memberId);


    //ChallengeMember 엔티티 대신, 특정 컬럼(여기서는 challengeId)만 선택하도록 JPQL 쿼리를 직접 작성, 그렇지 않으면 엔티티 전체를 받아와서 Integer type만 받아올 수 없음
    @Query("SELECT cm.challengeId FROM ChallengeMember cm WHERE cm.memberId = :memberId AND cm.status = :status")
    List<Integer> findChallengeIdsByMemberIdAndStatus(@Param("memberId") int memberId, @Param("status") String status);

    @Query("SELECT cm.challengeId FROM ChallengeMember cm WHERE cm.memberId = :memberId")
    List<Integer> findChallengeIdsByMemberId(@Param("memberId") int memberId);
}
