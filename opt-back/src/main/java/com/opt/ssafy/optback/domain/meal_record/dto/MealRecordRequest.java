package com.opt.ssafy.optback.domain.meal_record.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MealRecordRequest {

    private LocalDate createdDate;
    private String type;
}
