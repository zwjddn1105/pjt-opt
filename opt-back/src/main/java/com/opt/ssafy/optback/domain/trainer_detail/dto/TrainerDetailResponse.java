package com.opt.ssafy.optback.domain.trainer.dto;

import com.opt.ssafy.optback.domain.trainer.entity.TrainerDetail;
import lombok.Getter;

@Getter
public class TrainerDetailResponse {

    private final int trainer_id;
    private final boolean isOneDayAvailable;
    private final int gymId;
    private final String intro;
    private final int experienceYears;
    private final String availableHours;

    public TrainerDetailResponse(TrainerDetail trainerDetail) {
        this.trainer_id = trainerDetail.getTrainerId();
        this.isOneDayAvailable = trainerDetail.getIsOneDayAvailable();
        this.gymId = trainerDetail.getGym().getId();
        this.intro = trainerDetail.getIntro();
        this.experienceYears = trainerDetail.getExperienceYears();
        this.availableHours = trainerDetail.getAvailableHours();
    }
}
