package com.opt.ssafy.optback.domain.certificate.entity;

import com.opt.ssafy.optback.domain.certificate.dto.CertificateDto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "certificate")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "trainer_id")
    private Integer trainerId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "is_verified")
    private Boolean isVerified;

    @Column(name = "path")
    private String path;

    public static Certificate from(CertificateDto dto) {
        return Certificate.builder()
                .name(dto.getLevel())
                .trainerId(dto.getId())
                .isVerified(true)
                .path(dto.getNewPath())
                .build();
    }
}

