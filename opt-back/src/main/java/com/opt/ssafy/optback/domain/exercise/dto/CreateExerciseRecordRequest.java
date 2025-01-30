package com.opt.ssafy.optback.domain.exercise.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CreateExerciseRecordRequest {
    private Integer exerciseId;
    private Integer set;
    private Integer rep;
    private Integer weight;
    private List<MultipartFile> medias;
}
