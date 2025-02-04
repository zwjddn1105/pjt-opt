package com.opt.ssafy.optback.domain.trainer_review.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TrainerReviewRequest {

    private int trainerId;
    private String comment;
    private int rate;

}
