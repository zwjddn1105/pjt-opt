package com.opt.ssafy.optback.domain.menu.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MenuRequest {

    private String name;
    private int trainerId;
    private LocalDateTime createdAt;

}
