package com.opt.ssafy.optback.domain.trainer_review.controller;

import com.opt.ssafy.optback.domain.trainer_review.dto.TrainerReviewRequestDto;
import com.opt.ssafy.optback.domain.trainer_review.dto.TrainerReviewResponseDto;
import com.opt.ssafy.optback.domain.trainer_review.entity.TrainerReview;
import com.opt.ssafy.optback.domain.trainer_review.service.TrainerReviewImageService;
import com.opt.ssafy.optback.domain.trainer_review.service.TrainerReviewService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/trainer-reviews")
public class TrainerReviewController {

    private final TrainerReviewService trainerReviewService;
    private final UserDetailsService userDetailsService;
    private final TrainerReviewImageService trainerReviewImageService;

    private static final Logger logger = LoggerFactory.getLogger(TrainerReviewController.class);

    // 리뷰(텍스트+이미지) 추가
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TrainerReviewResponseDto> addTrainerReview(
            @RequestPart("review") TrainerReviewRequestDto reviewRequestDto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        // 리뷰 텍스트 저장
        TrainerReview savedTrainerReview = trainerReviewService.saveReviewText(reviewRequestDto);
        // 리뷰 이미지 저장
        if (images != null && !images.isEmpty()) {
            trainerReviewImageService.saveReviewImages(savedTrainerReview, images);
        }
        return ResponseEntity.ok(new TrainerReviewResponseDto(savedTrainerReview));

    }

    // 트레이너 리뷰 조회
    @GetMapping("/{trainer_id}")
    public ResponseEntity<List<TrainerReviewResponseDto>> getReviewsByTrainerId(
            @PathVariable("trainer_id") int trainerId) {
        List<TrainerReviewResponseDto> responseDtos = trainerReviewService.getReviewsByTrainerId(trainerId)
                .stream().map(TrainerReviewResponseDto::new).collect(Collectors.toList());
        return ResponseEntity.ok(responseDtos);
    }

    // 작성자(=로그인 멤버) 리뷰 조회
    @GetMapping
    public ResponseEntity<List<TrainerReviewResponseDto>> getReviewsByMyId() {
        List<TrainerReviewResponseDto> responseDtos = trainerReviewService.getReviewsByreviewerId()
                .stream().map(TrainerReviewResponseDto::new).collect(Collectors.toList());
        return ResponseEntity.ok(responseDtos);
    }
}
