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
    private int template_id;
    private int host_id;
    private Date startDate;
    private Date endDate;
    private String imagePath;
    private String status;
    private int max_participants;
    private int frequency;
    private String exercise_type;
    private Integer exercise_count;
    private Integer exercise_distance;
    private Integer exercise_duration;
}
