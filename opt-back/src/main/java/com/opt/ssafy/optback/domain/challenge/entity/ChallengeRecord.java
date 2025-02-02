package com.opt.ssafy.optback.domain.challenge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "challenge_record")
public class ChallengeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // 챌린지와 다대일 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id")
    private Challenge challenge;

    // 단순 Member 식별자 (추후 Member 엔티티와 연관관계를 맺을 수 있음)
    @Column(name = "member_id")
    private int memberId;

    @Temporal(TemporalType.DATE)
    @Column(name = "created_at")
    private Date createdAt;

    @Column(name = "count")
    private int count;

    @Column(name = "is_passed")
    private boolean isPassed;
}
