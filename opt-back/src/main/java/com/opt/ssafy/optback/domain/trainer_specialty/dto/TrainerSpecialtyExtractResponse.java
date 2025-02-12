package com.opt.ssafy.optback.domain.trainer_specialty.dto;

import java.util.List;

public class TrainerSpecialtyExtractResponse {
    private Integer trainerId;
    private List<TrainerSpecialtyResponse> extractedKeywords;
    private String message;

    public Integer getTrainerId() {
        return trainerId;
    }
    public void setTrainerId(int trainerId) {
        this.trainerId = trainerId;
    }
    public List<TrainerSpecialtyResponse> getExtractedKeywords() {
        return extractedKeywords;
    }
    public void setExtractedKeywords(List<TrainerSpecialtyResponse> extractedKeywords) {
        this.extractedKeywords = extractedKeywords;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}
