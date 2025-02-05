package com.opt.ssafy.optback.domain.menu.controller;

import com.opt.ssafy.optback.domain.menu.dto.MenuRequest;
import com.opt.ssafy.optback.domain.menu.dto.MenuResponse;
import com.opt.ssafy.optback.domain.menu.entity.Menu;
import com.opt.ssafy.optback.domain.menu.service.MenuService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/menus")
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<MenuResponse> getMenu(
            @RequestParam("trainerId") int trainerId,
            @RequestParam("createdDate") LocalDateTime localDateTime) {
        Menu menu = menuService.findMenuByTrainerIdAndCreatedAt(trainerId, localDateTime);
        return ResponseEntity.ok(new MenuResponse(menu));
    }

    @GetMapping("/trainer")
    public ResponseEntity<List<MenuResponse>> getTrainerMenus(@RequestParam("trainerId") int trainerId) {
        List<Menu> menus = menuService.findByTrainerId(trainerId);
        List<MenuResponse> menuResponses = new ArrayList<>();
        for (Menu menu : menus) {
            menuResponses.add(new MenuResponse(menu));
        }
        return ResponseEntity.ok(menuResponses);
    }

    @PostMapping
    public ResponseEntity<MenuResponse> addMenu(@RequestBody MenuRequest menuRequest) {
        Menu menu = menuService.saveMenu(menuRequest);
        return ResponseEntity.ok(new MenuResponse(menu));
    }

    @PatchMapping
    public ResponseEntity<MenuResponse> updateMenu(@RequestBody MenuRequest menuRequest) {
        Menu menu = menuService.updateMenu(menuRequest);
        return ResponseEntity.ok(new MenuResponse(menu));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteMenu(@RequestBody MenuRequest menuRequest) {
        menuService.deleteMenu(menuRequest);
        return ResponseEntity.ok().build();
    }
}
