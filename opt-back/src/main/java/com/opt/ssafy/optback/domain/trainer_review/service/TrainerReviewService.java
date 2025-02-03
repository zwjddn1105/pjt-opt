package com.opt.ssafy.optback.domain.trainer_review.service;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.trainer_review.dto.TrainerReviewRequestDto;
import com.opt.ssafy.optback.domain.trainer_review.entity.TrainerReview;
import com.opt.ssafy.optback.domain.trainer_review.exception.TrainerReviewNotFoundException;
import com.opt.ssafy.optback.domain.trainer_review.exception.TrainerReviewNotSaveException;
import com.opt.ssafy.optback.domain.trainer_review.repository.TrainerReviewRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrainerReviewService {

    private final TrainerReviewRepository trainerReviewRepository;
    private final TrainerReviewImageService trainerReviewImageService;
    private final UserDetailsServiceImpl userDetailsService;

    // 리뷰 저장
    @Transactional
    public TrainerReview saveReviewWithImages(TrainerReviewRequestDto reviewRequestDto, List<MultipartFile> images) {
        // 로그인 멤버
        Member member = userDetailsService.getMemberByContextHolder();
        int reviewerId = member.getId();

        // 리뷰 텍스트 저장
        TrainerReview savedReview = saveReviewText(reviewRequestDto);

        // 리뷰 이미지 저장
        if (images != null && !images.isEmpty()) {
            trainerReviewImageService.saveReviewImages(savedReview, images);
        }

        return savedReview;
    }

    // 리뷰 텍스트 저장
    @Transactional
    public TrainerReview saveReviewText(TrainerReviewRequestDto trainerReviewRequestDto) {
        // 로그인 멤버
        Member member = userDetailsService.getMemberByContextHolder();
        int reviewerId = member.getId();
        
        TrainerReview newTrainerReview = TrainerReview.builder()
                .reviewerId(reviewerId)
                .trainerId(trainerReviewRequestDto.getTrainerId())
                .comment(trainerReviewRequestDto.getComment())
                .rate(trainerReviewRequestDto.getRate())
                .build();

        // 유효성 검사
        if (newTrainerReview.getReviewerId() == 0) {
            throw new TrainerReviewNotSaveException("리뷰어 ID가 없습니다");
        }
        if (newTrainerReview.getTrainerId() == 0) {
            throw new TrainerReviewNotSaveException("트레이너 ID가 없습니다");
        }
        if (newTrainerReview.getComment() == null || newTrainerReview.getComment().trim().isEmpty()) {
            throw new TrainerReviewNotSaveException("리뷰 내용이 없습니다");
        }
        if (newTrainerReview.getRate() < 1 || newTrainerReview.getRate() > 5) {
            throw new TrainerReviewNotSaveException("평점 값이 유효하지 않습니다");
        }

        TrainerReview savedTrainerReview = trainerReviewRepository.save(newTrainerReview);

        return savedTrainerReview;
    }

    // 트레이너 ID로 리뷰 조회
    public List<TrainerReview> getReviewsByTrainerId(int trainerId) {
        // 유효성 검사
        if (trainerReviewRepository.findByTrainerId(trainerId) == null) {
            throw new TrainerReviewNotFoundException("트레이너 ID 값이 잘못 되었습니다");
        }
        return trainerReviewRepository.findByTrainerId(trainerId);
    }

    // 멤버 ID(=로그인 멤버)로 리뷰 조회
    public List<TrainerReview> getReviewsByreviewerId() {

        Member member = userDetailsService.getMemberByContextHolder();
        int reviewerId = member.getId();

        // 유효성 검사
        if (trainerReviewRepository.findByreviewerId(reviewerId) == null) {
            throw new TrainerReviewNotFoundException("멤버 ID 값이 잘못 되었습니다");
        }
        return trainerReviewRepository.findByreviewerId(reviewerId);
    }

}
