package com.opt.ssafy.optback.domain.follow.api;

import com.opt.ssafy.optback.domain.follow.exception.FollowNotFoundException;
import com.opt.ssafy.optback.global.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class FollowExceptionHandler {

    @ExceptionHandler(FollowNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleFollowNotFoundException(FollowNotFoundException ex) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    // 필요에 따라 다른 follow 관련 예외 처리 메서드 추가 가능
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("Internal Server Error: " + ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
