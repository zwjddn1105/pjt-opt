package com.opt.ssafy.optback.domain.trainer_specialty.dto;

public class TrainerSpecialtyExtractRequest {
    /**
     * trainer_detail.intro 대신 사용할 선택적 한 줄 소개.
     * 입력되지 않으면 기존 trainer_detail의 intro 값 사용.
     */
    private String introOverride;

    public String getIntroOverride() {
        return introOverride;
    }

    public void setIntroOverride(String introOverride) {
        this.introOverride = introOverride;
    }
}
