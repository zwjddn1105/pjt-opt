package com.opt.ssafy.optback.domain.meal_record.controller;

import com.opt.ssafy.optback.domain.meal_record.dto.CreateMealRecord;
import com.opt.ssafy.optback.domain.meal_record.dto.MealRecordRequest;
import com.opt.ssafy.optback.domain.meal_record.dto.MealRecordResponse;
import com.opt.ssafy.optback.domain.meal_record.entity.MealRecord;
import com.opt.ssafy.optback.domain.meal_record.service.MealRecordService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/meal-records")
public class MealRecordController {

    private final MealRecordService mealRecordService;

    // 당일 식단(이미지 포함) 등록
    @PostMapping
    public ResponseEntity<MealRecordResponse> addMealRecord(CreateMealRecord mealRequestDto) {
        try {
            System.out.println("🐤 요청 도착");
            System.out.println("📅 createdDate: " + mealRequestDto.getCreatedDate());
            System.out.println("🍽️ type: " + mealRequestDto.getType());

            if (mealRequestDto.getImage() != null && !mealRequestDto.getImage().isEmpty()) {
                System.out.println("🐤️ 이미지 파일: " + mealRequestDto.getImage().getOriginalFilename());
            } else {
                System.out.println("❌ 이미지 없음");
            }

            MealRecord savedMealRecord = mealRecordService.saveMealRecord(mealRequestDto, mealRequestDto.getImage());
            return ResponseEntity.ok(new MealRecordResponse(savedMealRecord));
        } catch (Exception e) {
            System.err.println("❌ 서버 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

//    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<MealRecordResponse> addMealRecord(
//            @RequestPart("meal") MealRecordRequest mealRequestDto,
//            @RequestPart(value = "image") MultipartFile image) {
//        MealRecord savedMealRecord = mealRecordService.saveMealRecord(mealRequestDto, image);
//        return ResponseEntity.ok(new MealRecordResponse(savedMealRecord));
//    }

    // 당일 식단 수정
    @PatchMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MealRecordResponse> updateMealRecord(
            @RequestPart("saved") MealRecordRequest mealRequestDto,
            @RequestPart("update") MealRecordRequest updateRequestDto,
            @RequestPart(value = "updateImage", required = false) MultipartFile updateImage) {
        MealRecord updatedRecord = mealRecordService.updateMealRecord(mealRequestDto, updateRequestDto, updateImage);
        return ResponseEntity.ok(new MealRecordResponse(updatedRecord));
    }

    // 식단 분석
    @PatchMapping("/analyze-nutrition")
    public ResponseEntity<MealRecordResponse> updateNutrition(
            @RequestParam("createdDate") LocalDate createdDate,
            @RequestParam("type") String type) {
        MealRecordRequest mealRequestDto = new MealRecordRequest(createdDate, type);
        MealRecord updatedRecord = mealRecordService.updateNutrition(mealRequestDto);
        return ResponseEntity.ok(new MealRecordResponse(updatedRecord));
    }

    // 당일 식단 삭제
    @DeleteMapping
    public ResponseEntity<Void> deleteMealRecord(@RequestBody MealRecordRequest mealRequestDto) {
        mealRecordService.deleteMealRecord(mealRequestDto);
        return ResponseEntity.ok().build();
    }

    // 식단 조회
    @GetMapping
    public ResponseEntity<MealRecordResponse> getMealRecords(
            @RequestParam("createdDate") LocalDate createdDate,
            @RequestParam("type") String type) {
        MealRecordRequest mealRequestDto = new MealRecordRequest(createdDate, type);
        MealRecord mealRecord = mealRecordService.findMealRecordByMemberTypeAndDate(mealRequestDto);
        return ResponseEntity.ok(new MealRecordResponse(mealRecord));
    }

}
