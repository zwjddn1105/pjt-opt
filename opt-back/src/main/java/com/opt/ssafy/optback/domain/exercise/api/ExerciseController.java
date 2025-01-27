package com.opt.ssafy.optback.domain.exercise.api;

import com.opt.ssafy.optback.domain.exercise.application.ExerciseService;
import com.opt.ssafy.optback.domain.exercise.dto.ExerciseDetailResponse;
import com.opt.ssafy.optback.domain.exercise.dto.ExerciseInfoResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    @GetMapping
    public ResponseEntity<List<ExerciseInfoResponse>> getAllExercises() {
        List<ExerciseInfoResponse> exerciseInfos = exerciseService.getAllExerciseInfos();
        return ResponseEntity.ok(exerciseInfos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseDetailResponse> getExerciseDetailById(@PathVariable Integer id) {
        ExerciseDetailResponse exerciseDetail = exerciseService.getExerciseDetailById(id);
        return ResponseEntity.ok(exerciseDetail);
    }

}
