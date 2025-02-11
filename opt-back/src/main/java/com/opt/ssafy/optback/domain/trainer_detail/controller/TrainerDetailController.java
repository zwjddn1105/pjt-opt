package com.opt.ssafy.optback.domain.trainer.controller;

import com.opt.ssafy.optback.domain.trainer.Service.TrainerDetailService;
import com.opt.ssafy.optback.domain.trainer.dto.TrainerDetailResponse;
import com.opt.ssafy.optback.domain.trainer.dto.TrainerSearchRequest;
import com.opt.ssafy.optback.domain.trainer.entity.TrainerDetail;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/trainers")
public class TrainerDetailController {

    private final TrainerDetailService trainerService;

    // 트레이너 상세 정보 조회
    @GetMapping("/details/{trainer_id}")
    public ResponseEntity<TrainerDetailResponse> getTrainerByTrainerId(@PathVariable("trainer_id") int trainerId) {
        TrainerDetail response = trainerService.findById(trainerId);
        return ResponseEntity.ok(new TrainerDetailResponse(response));
    }

    // 트레이너 검색
    @PostMapping("/search")
    public ResponseEntity<List<TrainerDetailResponse>> getSearchTrainers(
            @RequestBody TrainerSearchRequest request) {
        List<TrainerDetail> trainers = trainerService.searchAndSortTrainers(request);
        List<TrainerDetailResponse> responses = trainers.stream().map(TrainerDetailResponse::new).toList();
        return ResponseEntity.ok(responses);
    }

    // 트레이너 추천
    @PostMapping("/recommends")
    public ResponseEntity<List<TrainerDetailResponse>> getRecommendTrainers(
            @RequestBody TrainerSearchRequest request) {
        List<TrainerDetail> trainers = trainerService.getRecommendedTrainers(request);
        List<TrainerDetailResponse> responses = trainers.stream().map(TrainerDetailResponse::new).toList();
        return ResponseEntity.ok(responses);
    }

}
