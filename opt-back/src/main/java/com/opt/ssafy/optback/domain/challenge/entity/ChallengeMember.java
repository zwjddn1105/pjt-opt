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

    // 챌린지 ID (참여하고자 하는 챌린지)
    @Column(name = "challenge_id")
    private int challengeId;

    // 참여한 회원의 ID
    @Column(name = "member_id")
    private int memberId;

    // 참여 상태 (예: "JOINED", "QUIT")
    @Column(name = "status", length = 10)
    private String status;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "join_at")
    private Date joinAt;

    // 도메인 메서드: 챌린지 탈퇴 시 상태를 "quit"으로 변경
    public void quit() {
        this.status = "quit";
    }
}
