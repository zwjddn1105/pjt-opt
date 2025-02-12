package com.opt.ssafy.optback.domain.trainer_specialty.entity;

import com.opt.ssafy.optback.domain.member.entity.Member;

import jakarta.persistence.*;

@Entity
public class TrainerDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Member와 1:1 연관관계 (예: 한 멤버가 한 TrainerDetail을 가짐)
    @OneToOne
    @JoinColumn(name = "member_id", referencedColumnName = "id")
    private Member member;

    // 한 줄 소개 (TEXT 타입)
    @Column(columnDefinition = "TEXT")
    private String intro;

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
    public String getIntro() {
        return intro;
    }
    public void setIntro(String intro) {
        this.intro = intro;
    }
}
