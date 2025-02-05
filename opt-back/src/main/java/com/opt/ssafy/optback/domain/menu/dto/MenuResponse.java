package com.opt.ssafy.optback.domain.menu.dto;

import com.opt.ssafy.optback.domain.menu.entity.Menu;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MenuResponse {

    private String name;
    private int price;
    private int totalSessions;
    private LocalDateTime createdAt;

    public MenuResponse(Menu menu) {
        this.name = menu.getName();
        this.price = menu.getPrice();
        this.totalSessions = menu.getTotalSessions();
        this.createdAt = menu.getCreatedAt();
    }
}
