package com.opt.ssafy.optback.domain.trainer_specialty.api;

import com.opt.ssafy.optback.domain.trainer_specialty.application.TrainerSpecialtyService;
import com.opt.ssafy.optback.domain.trainer_specialty.dto.TrainerSpecialtyExtractRequest;
import com.opt.ssafy.optback.domain.trainer_specialty.dto.TrainerSpecialtyExtractResponse;
import com.opt.ssafy.optback.domain.trainer_specialty.dto.TrainerSpecialtiesResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/trainers")
public class TrainerSpecialtyController {

    private final TrainerSpecialtyService trainerSpecialtyService;

    public TrainerSpecialtyController(TrainerSpecialtyService trainerSpecialtyService) {
        this.trainerSpecialtyService = trainerSpecialtyService;
    }

    // trainer_detail의 intro로부터 키워드를 추출하여 저장
    @PostMapping("/extract")
    public ResponseEntity<TrainerSpecialtyExtractResponse> extractSpecialty(
            @RequestBody TrainerSpecialtyExtractRequest request) {
        TrainerSpecialtyExtractResponse response = trainerSpecialtyService.extractAndSaveSpecialty(request);
        return ResponseEntity.ok(response);
    }


    // 현재 로그인한 트레이너의 전문 분야(키워드) 불러오기
    @GetMapping("/specialties")
    public ResponseEntity<TrainerSpecialtiesResponse> getSpecialties() {
        TrainerSpecialtiesResponse response = trainerSpecialtyService.getSpecialtiesForCurrentTrainer();
        return ResponseEntity.ok(response);
    }
}
