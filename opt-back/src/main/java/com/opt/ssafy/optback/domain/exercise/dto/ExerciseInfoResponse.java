package com.opt.ssafy.optback.domain.exercise.dto;

import com.opt.ssafy.optback.domain.exercise.entity.Exercise;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ExerciseInfoResponse {
    private Integer id;
    private String name;
    private String bodyPart;
    private String gifPath;

    public static ExerciseInfoResponse from(Exercise exercise) {
        return ExerciseInfoResponse.builder()
                .id(exercise.getId())
                .name(exercise.getName())
                .bodyPart(exercise.getBodyPart())
                .gifPath(exercise.getGifPath())
                .build();
    }
}
