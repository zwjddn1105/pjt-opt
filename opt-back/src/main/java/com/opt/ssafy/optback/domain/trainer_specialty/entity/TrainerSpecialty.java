package com.opt.ssafy.optback.domain.trainer_specialty.entity;

import com.opt.ssafy.optback.domain.member.entity.Member;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class TrainerSpecialty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 현재 로그인한 트레이너(Member)와 다대일 관계
    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private String keyword;

    // DECIMAL(5,2) 타입에 맞게 BigDecimal 사용 (예: 0.95)
    @Column(precision = 5, scale = 2)
    private BigDecimal similarityScore;

    // Getter, Setter

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Member getMember() {
        return member;
    }
    public void setMember(Member member) {
        this.member = member;
    }
    public String getKeyword() {
        return keyword;
    }
    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
    public BigDecimal getSimilarityScore() {
        return similarityScore;
    }
    public void setSimilarityScore(BigDecimal similarityScore) {
        this.similarityScore = similarityScore;
    }
}
