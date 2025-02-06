package com.opt.ssafy.optback.domain.challenge.dto;

import com.opt.ssafy.optback.domain.challenge.entity.ChallengeRecord;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ChallengeRecordResponse {
    private int challengeId;
    private int count;
    private boolean isPassed;
    private Date createdAt;

    public static ChallengeRecordResponse fromEntity(ChallengeRecord record) {
        return new ChallengeRecordResponse(
                record.getChallenge().getId(),
                record.getCount(),
                record.isPassed(),
                record.getCreatedAt()
        );
    }
}


