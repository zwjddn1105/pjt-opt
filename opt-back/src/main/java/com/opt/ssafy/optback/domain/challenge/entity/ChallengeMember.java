package com.opt.ssafy.optback.domain.challenge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "challenge_member")
public class ChallengeMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "challenge_id")
    private int challengeId;

    @Column(name = "member_id")
    private int memberId;

    @Column(name = "status", columnDefinition = "char(10)")
    private String status;  // 예: "JOINED", "quit", 등

    // DB에서는 join_at이 date 타입이며 default (curdate())로 설정됨
    @Temporal(TemporalType.DATE)
    @Column(name = "join_at", nullable = false)
    private Date joinAt;

    // 도메인 메서드: 챌린지 탈퇴 시 status를 "END"으로 변경
}
