package com.opt.ssafy.optback.domain.menu.repository;

import com.opt.ssafy.optback.domain.menu.entity.Menu;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<Menu, Integer> {

    List<Menu> findByTrainerId(int trainerId);

    Menu findByTrainerIdAndCreatedAt(int trainerId, LocalDateTime createdAt);
}
