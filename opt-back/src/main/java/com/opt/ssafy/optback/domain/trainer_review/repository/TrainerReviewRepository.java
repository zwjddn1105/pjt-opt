package com.opt.ssafy.optback.domain.trainer_review.repository;

import com.opt.ssafy.optback.domain.trainer_review.entity.TrainerReview;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainerReviewRepository extends JpaRepository<TrainerReview, Integer> {

    List<TrainerReview> findByreviewerId(Integer reviewerId);

    List<TrainerReview> findByTrainerId(Integer trainerId);

}
