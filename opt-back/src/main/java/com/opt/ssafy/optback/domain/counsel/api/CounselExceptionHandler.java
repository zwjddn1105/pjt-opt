package com.opt.ssafy.optback.domain.counsel.api;

import com.opt.ssafy.optback.domain.counsel.exception.CounselNotFoundException;
import com.opt.ssafy.optback.domain.counsel.exception.TrainerNotFoundException;
import com.opt.ssafy.optback.global.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CounselExceptionHandler {

    @ExceptionHandler(CounselNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCounselNotFoundException(CounselNotFoundException ex) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(TrainerNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTrainerNotFoundException(TrainerNotFoundException ex) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message(ex.getMessage())
                .build();
        // 트레이너가 존재하지 않으면 400 (Bad Request) 또는 상황에 따라 다른 상태 코드를 사용할 수 있습니다.
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    // 그 외의 모든 예외를 처리하는 핸들러 (선택 사항)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("Internal Server Error: " + ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
