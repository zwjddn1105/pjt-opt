package com.opt.ssafy.optback;

import static org.assertj.core.api.Assertions.assertThat;

import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.member.entity.Role;
import com.opt.ssafy.optback.domain.trainer.Service.TrainerDetailService;
import com.opt.ssafy.optback.domain.trainer.dto.TrainerSearchRequest;
import com.opt.ssafy.optback.domain.trainer.entity.TrainerDetail;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;

@ExtendWith(org.springframework.test.context.junit.jupiter.SpringExtension.class)
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)  // 🔹 실제 DB 사용
@Transactional // 테스트 후 자동 롤백
class TrainerDetailServiceTest {

    @Autowired
    private TrainerDetailService trainerDetailService;

    private Pageable pageable;

    @BeforeEach
    void setUp() {
        Member testMember = Member.builder()
                .id(100)
                .email("testuser@example.com")
                .nickname("테스트 유저")
                .password("testpassword")
                .role(Role.ROLE_USER) // 일반 유저 권한
                .isDeleted(false)
                .isOnboarded(true)
                .build();
        pageable = PageRequest.of(0, 10); // 🔹 페이지 설정 (0페이지, 10개씩)
    }

    @Test
    @DisplayName("트레이너 ID로 트레이너 조회 테스트")
    void testFindById() {
        // 🔹 테스트 실행
        TrainerDetail trainer = trainerDetailService.findById(3);

        // 🔹 검증
        assertThat(trainer).isNotNull();
        assertThat(trainer.getTrainerId()).isEqualTo(3);
    }


    @Test
    @WithMockUser(username = "testuser@example.com", roles = "USER")  // 🔹 가짜 로그인 사용자 추가
    @DisplayName("추천 트레이너 조회 테스트")
    void testGetRecommendedTrainers() {
        Pageable pageable = PageRequest.of(0, 10);
        TrainerSearchRequest request = new TrainerSearchRequest(
                new BigDecimal("37.5665"), new BigDecimal("126.9780"), null, null, null, "recommendation"
        );

        Page<TrainerDetail> result = trainerDetailService.getRecommendedTrainers(request, pageable);

        // 🔹 검증
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isNotEmpty();
    }

    @Test
    @DisplayName("✅ 트레이너 검색 테스트 (추천순)")
    void testSearchTrainersByRecommendation() {
        // 🔹 검색 요청 설정 (추천순)
        TrainerSearchRequest request = new TrainerSearchRequest(
                new BigDecimal("37.5665"), new BigDecimal("126.9780"), null, null, List.of("근력 강화"), "recommendation"
        );

        // 🔹 서비스 실행
        Page<TrainerDetail> result = trainerDetailService.searchAndSortTrainers(request, pageable);

        // 🔹 검증
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSizeGreaterThan(0); // ✅ 최소한 1명의 트레이너 존재해야 함
        assertThat(result.getContent().get(0).getTrainerId()).isPositive();
    }

    @Test
    @DisplayName("✅ 트레이너 검색 테스트 (이름 검색)")
    void testSearchTrainersByName() {
        // 🔹 특정 이름 포함 검색
        TrainerSearchRequest request = new TrainerSearchRequest(
                null, null, "Char", null, null, null
        );

        // 🔹 서비스 실행
        Page<TrainerDetail> result = trainerDetailService.searchAndSortTrainers(request, pageable);

        // 🔹 검증
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSizeGreaterThan(0); // ✅ 이름에 "Coach"가 포함된 트레이너 존재해야 함
        assertThat(result.getContent().get(0).getIntro()).contains("Char");
    }

    @Test
    @DisplayName("✅ 트레이너 검색 테스트 (주소 검색)")
    void testSearchTrainersByAddress() {
        // 🔹 특정 주소 포함 검색
        TrainerSearchRequest request = new TrainerSearchRequest(
                null, null, null, "서울", null, null
        );

        // 🔹 서비스 실행
        Page<TrainerDetail> result = trainerDetailService.searchAndSortTrainers(request, pageable);

        // 🔹 검증
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSizeGreaterThan(0); // ✅ 서울 포함된 주소 트레이너 존재해야 함
    }

    @Test
    @DisplayName("✅ 트레이너 검색 테스트 (관심사 검색)")
    void testSearchTrainersByInterest() {
        // 🔹 관심사가 "요가"인 트레이너 검색
        TrainerSearchRequest request = new TrainerSearchRequest(
                null, null, null, null, List.of("근력 향상"), null
        );

        // 🔹 서비스 실행
        Page<TrainerDetail> result = trainerDetailService.searchAndSortTrainers(request, pageable);

        // 🔹 검증
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSizeGreaterThan(0); // ✅ 관심사가 "요가"인 트레이너 존재해야 함
    }

    @Test
    @DisplayName("✅ 트레이너 검색 테스트 (거리순 정렬)")
    void testSearchTrainersByDistance() {
        // 🔹 거리순 정렬
        TrainerSearchRequest request = new TrainerSearchRequest(
                new BigDecimal("37.5665"), new BigDecimal("126.9780"), null, null, null, "distance"
        );

        // 🔹 서비스 실행
        Page<TrainerDetail> result = trainerDetailService.searchAndSortTrainers(request, pageable);

        // 🔹 검증
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isNotEmpty(); // ✅ 최소한 1명의 트레이너 존재해야 함
    }

    @Test
    @DisplayName("✅ 트레이너 검색 테스트 (검색 결과 없음)")
    void testSearchTrainersNoResult() {
        // 🔹 존재하지 않는 트레이너 이름 검색
        TrainerSearchRequest request = new TrainerSearchRequest(
                null, null, "ZZZ", null, null, null
        );

        // 🔹 서비스 실행
        Page<TrainerDetail> result = trainerDetailService.searchAndSortTrainers(request, pageable);

        // 🔹 검증 (결과 없음)
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty(); // ✅ 검색 결과가 없어야 함
    }
}

