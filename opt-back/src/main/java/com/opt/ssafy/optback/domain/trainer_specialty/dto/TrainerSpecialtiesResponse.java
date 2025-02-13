package com.opt.ssafy.optback.domain.trainer_specialty.dto;

import java.util.List;

public class TrainerSpecialtiesResponse {
    private Integer trainerId;
    private List<TrainerSpecialtyResponse> specialties;

    public Integer getTrainerId() {
        return trainerId;
    }
    public void setTrainerId(Integer trainerId) {
        this.trainerId = trainerId;
    }
    public List<TrainerSpecialtyResponse> getSpecialties() {
        return specialties;
    }
    public void setSpecialties(List<TrainerSpecialtyResponse> specialties) {
        this.specialties = specialties;
    }
}
