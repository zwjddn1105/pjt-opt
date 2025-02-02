package com.opt.ssafy.optback.domain.exercise.dto;

import java.util.List;
import lombok.Getter;

@Getter
public class UpdateExerciseRecordRequest {
    private Integer set;
    private Integer rep;
    private Integer weight;
    private List<Integer> mediaIdsToDelete;
}
