package com.opt.ssafy.optback.domain.challenge.dto;

import com.opt.ssafy.optback.domain.challenge.entity.ChallengeRecord;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ChallengeRecordResponse {
    private int challengeId;
    private int count;
    private int distance;
    private int duration;
    private boolean isPassed;
    private Date createdAt;
    private float progressPerDay;

    public static ChallengeRecordResponse fromEntity(ChallengeRecord record) {
        float progress = 0.0f;

        if (record.getChallenge() != null
                && ("NORMAL".equals(record.getChallenge().getType())
                || "SURVIVAL".equals(record.getChallenge().getType()))
                && record.getChallenge().getExerciseCount() > 0) {
            progress = Math.round((float) record.getCount() / record.getChallenge().getExerciseCount() * 100);
        }

        return new ChallengeRecordResponse(
                record.getChallenge().getId(),
                record.getCount(),
                record.getDistance(),
                record.getDuration(),
                record.isPassed(),
                record.getCreatedAt(),
                progress
        );
    }
}


