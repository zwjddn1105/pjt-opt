package com.opt.ssafy.optback.domain.challenge.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class CreateChallengeRequest {
    private String type;
    private String title;
    private String description;
    private String reward;
    private Date startDate;
    private Date endDate;
    private String status;
}
