package com.opt.ssafy.optback.domain.member.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Getter
@Table(name = "trainer_detail")
public class TrainerDetail {

    @Id
    @Column(name = "trainer_id", nullable = false)
    private Integer trainerId;

    @Column(name = "is_one_day_available", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isOneDayAvailable = false;

    @Column(name = "gym_id")
    private Integer gymId;

    @Column(name = "intro", columnDefinition = "TEXT")
    private String intro;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "available_hours", length = 10)
    private String availableHours;

    @OneToOne
    @JoinColumn(name = "trainer_id", referencedColumnName = "id")
    private Member member;

    public void updateIntro(String intro) {
        this.intro = intro;
    }

}
