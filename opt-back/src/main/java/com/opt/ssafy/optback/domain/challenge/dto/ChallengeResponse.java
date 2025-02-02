package com.opt.ssafy.optback.domain.challenge.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Date;

@Getter
@Builder
public class ChallengeResponse {
    private int id;
    private String type;
    private String title;
    private String description;
    private String reward;
    private Date startDate;
    private Date endDate;
    private String status;
}
