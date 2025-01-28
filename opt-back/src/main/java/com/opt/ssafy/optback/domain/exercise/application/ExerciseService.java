package com.opt.ssafy.optback.domain.exercise.application;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.exercise.dto.ExerciseDetailResponse;
import com.opt.ssafy.optback.domain.exercise.dto.ExerciseFavoriteRequest;
import com.opt.ssafy.optback.domain.exercise.dto.ExerciseInfoResponse;
import com.opt.ssafy.optback.domain.exercise.entity.Exercise;
import com.opt.ssafy.optback.domain.exercise.entity.FavoriteExercise;
import com.opt.ssafy.optback.domain.exercise.exception.ExerciseNotFoundException;
import com.opt.ssafy.optback.domain.exercise.repository.ExerciseFavoriteRepository;
import com.opt.ssafy.optback.domain.exercise.repository.ExerciseRepository;
import com.opt.ssafy.optback.domain.member.entity.Member;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class ExerciseService {

    private final UserDetailsServiceImpl userDetailsService;
    private final ExerciseRepository exerciseRepository;
    private final ExerciseFavoriteRepository exerciseFavoriteRepository;

    public List<ExerciseInfoResponse> getAllExerciseInfos() {
        List<Exercise> exercises = exerciseRepository.findAll();
        return exercises.stream().map(ExerciseInfoResponse::from).toList();
    }

    public ExerciseDetailResponse getExerciseDetailById(Integer id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ExerciseNotFoundException("찾을 수 없는 운동입니다"));
        return ExerciseDetailResponse.from(exercise);
    }

    public List<ExerciseInfoResponse> getMyFavoriteExerciseInfos() {
        Member member = userDetailsService.getMemberByContextHolder();
        List<FavoriteExercise> exercises = member.getFavoriteExercises();
        return exercises.stream()
                .map(favoriteExercise -> favoriteExercise.getExercise())
                .map(ExerciseInfoResponse::from).toList();
    }

    public void addFavoriteExercise(ExerciseFavoriteRequest exerciseFavoriteRequest) {
        Member member = userDetailsService.getMemberByContextHolder();
        Exercise exercise = exerciseRepository.findById(exerciseFavoriteRequest.getExerciseId())
                .orElseThrow(() -> new ExerciseNotFoundException("찾을 수 없는 운동입니다"));
        FavoriteExercise favoriteExercise = FavoriteExercise.builder()
                .member(member)
                .exercise(exercise)
                .build();
        exerciseFavoriteRepository.save(favoriteExercise);
    }

    public void deleteFavoriteExercise(ExerciseFavoriteRequest exerciseFavoriteRequest) {
        Member member = userDetailsService.getMemberByContextHolder();
        Exercise exercise = exerciseRepository.findById(exerciseFavoriteRequest.getExerciseId())
                .orElseThrow(() -> new ExerciseNotFoundException("찾을 수 없는 운동입니다"));
        exerciseFavoriteRepository.deleteByExerciseAndMember(exercise, member);
    }

}
