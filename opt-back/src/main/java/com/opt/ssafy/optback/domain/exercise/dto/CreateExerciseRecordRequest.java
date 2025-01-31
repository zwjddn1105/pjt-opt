package com.opt.ssafy.optback.domain.exercise.dto;

import lombok.Getter;

@Getter
public class CreateExerciseRecordRequest {
    private Integer exerciseId;
    private Integer set;
    private Integer rep;
    private Integer weight;
}
