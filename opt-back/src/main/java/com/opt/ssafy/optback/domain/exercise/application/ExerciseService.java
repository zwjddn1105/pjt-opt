package com.opt.ssafy.optback.domain.exercise.application;

import com.opt.ssafy.optback.domain.exercise.dto.ExerciseDetailResponse;
import com.opt.ssafy.optback.domain.exercise.dto.ExerciseInfoResponse;
import com.opt.ssafy.optback.domain.exercise.entity.Exercise;
import com.opt.ssafy.optback.domain.exercise.exception.ExerciseNotFoundException;
import com.opt.ssafy.optback.domain.exercise.repository.ExerciseRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public List<ExerciseInfoResponse> getAllExerciseInfos() {
        List<Exercise> exercises = exerciseRepository.findAll();
        return exercises.stream().map(ExerciseInfoResponse::from).toList();
    }

    public ExerciseDetailResponse getExerciseDetailById(Integer id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ExerciseNotFoundException("찾을 수 없는 운동입니다"));
        return ExerciseDetailResponse.from(exercise);
    }
}
