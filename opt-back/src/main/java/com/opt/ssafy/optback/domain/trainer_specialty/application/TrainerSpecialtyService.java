package com.opt.ssafy.optback.domain.trainer_specialty.application;

import com.opt.ssafy.optback.domain.auth.application.UserDetailsServiceImpl;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.trainer_specialty.dto.TrainerSpecialtyExtractRequest;
import com.opt.ssafy.optback.domain.trainer_specialty.dto.TrainerSpecialtyExtractResponse;
import com.opt.ssafy.optback.domain.trainer_specialty.dto.TrainerSpecialtyResponse;
import com.opt.ssafy.optback.domain.trainer_specialty.dto.TrainerSpecialtiesResponse;
import com.opt.ssafy.optback.domain.trainer_specialty.entity.TrainerDetail;
import com.opt.ssafy.optback.domain.trainer_specialty.entity.TrainerSpecialty;
import com.opt.ssafy.optback.domain.trainer_specialty.exception.TrainerSpecialtyException;
import com.opt.ssafy.optback.domain.trainer_specialty.repository.TrainerDetailRepository;
import com.opt.ssafy.optback.domain.trainer_specialty.repository.TrainerSpecialtyRepository;
import com.opt.ssafy.optback.domain.trainer_specialty.util.KeywordExtractor;
import com.opt.ssafy.optback.domain.trainer_specialty.util.KeywordResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrainerSpecialtyService {

    private final TrainerDetailRepository trainerDetailRepository;
    private final TrainerSpecialtyRepository trainerSpecialtyRepository;
    private final UserDetailsServiceImpl userDetailsService;

    public TrainerSpecialtyService(TrainerDetailRepository trainerDetailRepository,
                                   TrainerSpecialtyRepository trainerSpecialtyRepository,
                                   UserDetailsServiceImpl userDetailsService) {
        this.trainerDetailRepository = trainerDetailRepository;
        this.trainerSpecialtyRepository = trainerSpecialtyRepository;
        this.userDetailsService = userDetailsService;
    }

    /**
     * trainer_detail.intro 또는 요청으로 전달된 intro_override를 활용하여
     * AI 기반 키워드 추출 후 trainer_specialty 테이블에 저장하는 메서드.
     */
    @Transactional
    public TrainerSpecialtyExtractResponse extractAndSaveSpecialty(TrainerSpecialtyExtractRequest request) {
        // 현재 로그인한 회원(Member)을 userDetailsService를 통해 가져옵니다.
        Member member = userDetailsService.getMemberByContextHolder();

        // trainer_detail 정보 조회 (Member의 id 기준)
        TrainerDetail trainerDetail = trainerDetailRepository.findByMemberId(member.getId())
                .orElseThrow(() -> new TrainerSpecialtyException("Trainer detail not found for member id: " + member.getId()));

        // 요청으로 intro_override가 전달되면 해당 값을 사용, 없으면 trainer_detail.intro 사용
        String intro = (request.getIntroOverride() != null && !request.getIntroOverride().isEmpty())
                ? request.getIntroOverride()
                : trainerDetail.getIntro();

        if (intro == null || intro.trim().isEmpty()) {
            throw new TrainerSpecialtyException("Trainer introduction is empty.");
        }

        // AI 기반 키워드 추출 (KeywordExtractor 내부에서는 외부 AI API 호출 등을 수행)
        List<KeywordResult> keywordResults = KeywordExtractor.extractKeywords(intro);

        // 추출된 각 키워드를 trainer_specialty 테이블에 저장
        keywordResults.forEach(kr -> {
            TrainerSpecialty specialty = new TrainerSpecialty();
            specialty.setMember(member);
            specialty.setKeyword(kr.getKeyword());
            specialty.setSimilarityScore(kr.getSimilarityScore());
            trainerSpecialtyRepository.save(specialty);
        });

        // 저장된 키워드들을 DTO로 변환하여 응답 객체 생성
        List<TrainerSpecialtyResponse> extractedKeywords = trainerSpecialtyRepository.findByMemberId(member.getId())
                .stream()
                .map(s -> new TrainerSpecialtyResponse(s.getKeyword(), s.getSimilarityScore()))
                .collect(Collectors.toList());

        TrainerSpecialtyExtractResponse response = new TrainerSpecialtyExtractResponse();
        response.setTrainerId(member.getId());
        response.setExtractedKeywords(extractedKeywords);
        response.setMessage("키워드 추출 및 저장에 성공하였습니다.");
        return response;
    }

    /**
     * 현재 로그인한 트레이너의 전문 분야(키워드) 목록 조회
     */
    @Transactional(readOnly = true)
    public TrainerSpecialtiesResponse getSpecialtiesForCurrentTrainer() {
        Member member = userDetailsService.getMemberByContextHolder();

        List<TrainerSpecialtyResponse> specialtyResponses = trainerSpecialtyRepository.findByMemberId(member.getId())
                .stream()
                .map(s -> new TrainerSpecialtyResponse(s.getKeyword(), s.getSimilarityScore()))
                .collect(Collectors.toList());

        TrainerSpecialtiesResponse response = new TrainerSpecialtiesResponse();
        response.setTrainerId(member.getId());
        response.setSpecialties(specialtyResponses);
        return response;
    }
}
