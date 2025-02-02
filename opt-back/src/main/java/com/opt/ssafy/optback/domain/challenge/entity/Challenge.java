package com.opt.ssafy.optback.domain.challenge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "challenge")
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "type", length = 10)
    private String type;

    @Column(name = "title", length = 50)
    private String title;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "reward", length = 100)
    private String reward;

    @Temporal(TemporalType.DATE)
    @Column(name = "start_date")
    private Date startDate;

    @Temporal(TemporalType.DATE)
    @Column(name = "end_date")
    private Date endDate;

    @Column(name = "status", length = 10)
    private String status;

}
