package com.opt.ssafy.optback.domain.challenge.dto;

import com.opt.ssafy.optback.domain.challenge.entity.ChallengeRecord;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ChallengeTeamRecordResponse {
    private int challengeId;
    private int count;
    private boolean isPassed;
    private Date createdAt;

    public static ChallengeTeamRecordResponse fromEntity(ChallengeRecord record) {

        return new ChallengeTeamRecordResponse(
                record.getChallenge().getId(),
                record.getCount(),
                record.isPassed(),
                record.getCreatedAt()
        );
    }
}


