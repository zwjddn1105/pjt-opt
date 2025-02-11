package com.opt.ssafy.optback.domain.license.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opt.ssafy.optback.domain.gym.entity.Gym;
import com.opt.ssafy.optback.domain.gym.repository.GymRepository;
import com.opt.ssafy.optback.domain.member.entity.Member;
import com.opt.ssafy.optback.domain.member.exception.MemberNotFoundException;
import com.opt.ssafy.optback.domain.member.repository.MemberRepository;
import com.opt.ssafy.optback.domain.trainer.entity.TrainerDetail;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final MemberRepository memberRepository;
    private final GymRepository gymRepository;

    @Transactional
    @KafkaListener(topics = "business_license_response", groupId = "spring-group")
    public void consume(String message) {
        log.info("Received JSON response from Kafka: {}", message);

        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            JsonNode gymIdNode = jsonNode.get("gym_id");
            String resultMessage = jsonNode.get("message").toString();
            if (gymIdNode == null || gymIdNode.isNull()) {
                sendResultMessage(resultMessage);
                return;
            }
            log.info("맞는 헬스장 데이터 : {}", jsonNode.toPrettyString());
            Integer memberId = Integer.parseInt(jsonNode.get("user_id").toString());
            Integer gymId = Integer.parseInt(jsonNode.get("gym_id").toString());

            Member member = memberRepository.findById(memberId).orElseThrow(MemberNotFoundException::new);
            Gym gym = gymRepository.findById(gymId).orElse(null);

            TrainerDetail trainerDetail = TrainerDetail.builder()
                    .trainerId(member.getId())
                    .gym(gym)
                    .build();
            
            member.grantTrainerRole(trainerDetail);
        } catch (Exception e) {
            log.error("Error parsing JSON: {}", e.getMessage());
        }
    }

    public void sendResultMessage(String message) {

    }

}
