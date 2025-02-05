package com.opt.ssafy.optback.domain.menu.service;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.menu.dto.MenuRequest;
import com.opt.ssafy.optback.domain.menu.entity.Menu;
import com.opt.ssafy.optback.domain.menu.repository.MenuRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final MenuRepository menuRepository;
    private final UserDetailsServiceImpl userDetailsService;

    // 트레이너의 메뉴 조회
    public List<Menu> findByTrainerId(int trainerId) {
        List<Menu> menus = menuRepository.findByTrainerId(trainerId);
        return menus;
    }

    // 메뉴 조회
    public Menu findMenuByTrainerIdAndCreatedAt(int trainerId, LocalDateTime createdAt) {
        Menu menu = menuRepository.findByTrainerIdAndCreatedAt(trainerId, createdAt);
        return menu;
    }

    // 메뉴 등록
    @Transactional
    public Menu saveMenu(MenuRequest menu) {
        Member member = userDetailsService.getMemberByContextHolder();
        int memberId = member.getId();
        
        return menuRepository.save(menu);
    }


    // 메뉴 삭제
    @Transactional
    public void deleteMenu(MenuRequest menu) {
    }

    // 메뉴 수정
    @Transactional
    public Menu updateMenu(MenuRequest menu) {
        return menuRepository.save(menu);
    }

}
