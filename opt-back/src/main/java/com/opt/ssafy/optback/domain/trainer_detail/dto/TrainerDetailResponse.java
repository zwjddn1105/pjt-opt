package com.opt.ssafy.optback.domain.trainer_detail.dto;

import com.opt.ssafy.optback.domain.trainer_detail.entity.TrainerDetail;
import java.util.List;
import lombok.Getter;

@Getter
public class TrainerDetailResponse {

    private int trainer_id;
    private boolean isOneDayAvailable;
    private int gymId;
    private String intro;
    private int experienceYears;
    private String availableHours;
    private List<String> keywords;

    public TrainerDetailResponse(TrainerDetail trainerDetail, List<String> keywords) {
        this.trainer_id = trainerDetail.getTrainerId();
        this.isOneDayAvailable = trainerDetail.getIsOneDayAvailable();
        this.gymId = trainerDetail.getGym().getId();
        this.intro = trainerDetail.getIntro();
        this.experienceYears = trainerDetail.getExperienceYears();
        this.availableHours = trainerDetail.getAvailableHours();
        this.keywords = keywords;
    }
}
