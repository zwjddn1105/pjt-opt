package com.opt.ssafy.optback.domain.follow.repository;

import com.opt.ssafy.optback.domain.follow.entity.Follow;
import com.opt.ssafy.optback.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Integer> {
    List<Follow> findByMember(Member member);
    List<Follow> findByTarget(Member target);
    void deleteByMemberAndTarget(Member member, Member target);
}