package com.opt.ssafy.optback.domain.menu.controller;

import com.opt.ssafy.optback.domain.menu.entity.Menu;
import com.opt.ssafy.optback.domain.menu.service.MenuService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/menus")
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/{id}")
    public ResponseEntity<Menu> getMenu(@PathVariable("id") int id) {
        Menu menu = menuService.findMenuById(id);
        return ResponseEntity.ok(menu);
    }

    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<Menu>> getTrainerMenus(@PathVariable("trainerId") int trainerId) {
        List<Menu> menus = menuService.findByTrainerId(trainerId);
        return ResponseEntity.ok(menus);
    }

    @PreAuthorize("hasRole('TRAINER')")
    @PostMapping
    public ResponseEntity<Menu> addMenu(@RequestBody Menu menu) {
        Menu savedMenu = menuService.saveMenu(menu);
        return ResponseEntity.ok(savedMenu);
    }

    @PreAuthorize("hasRole('TRAINER')")
    @PatchMapping("/{id}")
    public ResponseEntity<Menu> updateMenu(@PathVariable("id") int id, @RequestBody Menu menu) {
        Menu updatedMenu = menuService.updateMenu(id, menu);
        return ResponseEntity.ok(updatedMenu);
    }

    @PreAuthorize("hasRole('TRAINER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable("id") int id) {
        menuService.deleteMenu(id);
        return ResponseEntity.ok().build();
    }
}
