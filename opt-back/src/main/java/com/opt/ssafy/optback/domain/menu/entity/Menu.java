package com.opt.ssafy.optback.domain.menu.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "menu")
@Getter
@NoArgsConstructor
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "trainer_id", nullable = false)
    private int trainerId;

    @Column(name = "price", nullable = false)
    private int price;

    @Column(name = "total_sessions", nullable = false)
    private int totalSessions;

    @Column(name = "created_At", nullable = false)
    private LocalDateTime createdAt;
}
