package com.opt.ssafy.optback.domain.exercise.application;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.exercise.dto.CreateExerciseRecordRequest;
import com.opt.ssafy.optback.domain.exercise.entity.Exercise;
import com.opt.ssafy.optback.domain.exercise.entity.ExerciseRecord;
import com.opt.ssafy.optback.domain.exercise.entity.ExerciseRecordMedia;
import com.opt.ssafy.optback.domain.exercise.exception.ExerciseNotFoundException;
import com.opt.ssafy.optback.domain.exercise.repository.ExerciseRecordMediaRepository;
import com.opt.ssafy.optback.domain.exercise.repository.ExerciseRecordRepository;
import com.opt.ssafy.optback.domain.exercise.repository.ExerciseRepository;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.global.application.S3Service;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ExerciseRecordService {

    private final S3Service s3Service;
    private final ExerciseRepository exerciseRepository;
    private final ExerciseRecordRepository exerciseRecordRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final ExerciseRecordMediaRepository exerciseRecordMediaRepository;
    @Value("${exercise.media.bucket.name}")
    private String bucketName;

    public void createExerciseRecord(CreateExerciseRecordRequest request, List<MultipartFile> medias)
            throws IOException {
        Member member = userDetailsService.getMemberByContextHolder();
        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new ExerciseNotFoundException("운동을 찾지 못함"));
        ExerciseRecord exerciseRecord = exerciseRecordRepository.save(ExerciseRecord.builder()
                .member(member)
                .exercise(exercise)
                .rep(request.getRep())
                .sets(request.getSet())
                .weight(request.getWeight())
                .build());
        saveExerciseMedias(exerciseRecord.getId(), medias);
    }

    private void saveExerciseMedias(Integer exerciseRecordId, List<MultipartFile> medias) throws IOException {
        for (MultipartFile media : medias) {
            String fileName = media.getOriginalFilename();
            String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
            List<ExerciseRecordMedia> recordMedias = new ArrayList<>();
            if (List.of("jpg", "jpeg", "png", "gif").contains(extension)) {
                String path = s3Service.uploadImageFile(media, bucketName);
                ExerciseRecordMedia recordMedia = ExerciseRecordMedia.builder()
                        .exerciseRecordId(exerciseRecordId)
                        .mediaType("IMAGE")
                        .mediaPath(path)
                        .build();
                recordMedias.add(recordMedia);
            }
            if (List.of("mp4", "avi", "mov", "mkv").contains(extension)) {
                String path = s3Service.uploadVideoFile(media, bucketName);
                ExerciseRecordMedia recordMedia = ExerciseRecordMedia.builder()
                        .exerciseRecordId(exerciseRecordId)
                        .mediaType("VIDEO")
                        .mediaPath(path)
                        .build();
                recordMedias.add(recordMedia);
            }
            exerciseRecordMediaRepository.saveAll(recordMedias);
        }
    }

}
