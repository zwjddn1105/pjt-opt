package com.opt.ssafy.optback.domain.exercise.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "exercise_record_media")
public class ExerciseRecordMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "exercise_record_id")
    private Integer exerciseRecordId;

    @Column(name = "media_type")
    private String mediaType;

    @Column(name = "media_path")
    private String mediaPath;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
