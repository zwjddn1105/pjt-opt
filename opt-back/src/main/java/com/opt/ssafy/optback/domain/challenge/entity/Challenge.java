package com.opt.ssafy.optback.domain.challenge.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "challenge")
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "type", length = 10)
    private String type;

    // DB에서는 char(50)로 선언되어 있으므로, columnDefinition을 사용
    @Column(name = "title", columnDefinition = "char(50)")
    private String title;

    @Column(name = "description", columnDefinition = "char(255)")
    private String description;

    @Column(name = "template_id")
    private int templateId;

    @Column(name = "host_id")
    private int hostId;

    @Column(name = "winner_id")
    private Integer winnerId; // null 가능

    @Temporal(TemporalType.DATE)
    @Column(name = "start_date")
    private Date startDate;

    @Temporal(TemporalType.DATE)
    @Column(name = "end_date")
    private Date endDate;

    @Column(name = "status", columnDefinition = "char(10)")
    private String status;

    @Column(name = "reward", columnDefinition = "char(100)")
    private String reward;

    // DB에서 default CURRENT_TIMESTAMP로 생성되므로 insert/update는 하지 않음.
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", insertable = false, updatable = false)
    private Date createdAt;

    @Column(name = "current_participants")
    private Integer currentParticipants;

    @Column(name = "max_participants")
    private int maxParticipants;

    @Column(name = "frequency")
    private int frequency;

    @Column(name = "progress")
    private Float progress;

    @Column(name = "image_path", columnDefinition = "char(255)")
    private String imagePath;

    @Column(name = "exercise_type", length = 10)
    private String exerciseType;

    @Column(name = "exercise_count")
    private int exerciseCount;

    @OneToMany
    private List<ChallengeMember> members;

    public void setWinner(Integer id) {
        winnerId = id;
    }

    public void setCurrentParticipants(int i) {
        currentParticipants = i;
    }

    public void setProgress(float newProgress) {
        progress = newProgress;
    }

    public void setStatus(String newStatus) {
        status = newStatus;
    }
}
