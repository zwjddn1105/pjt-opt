package com.opt.ssafy.optback.domain.trainer_specialty.util;

import java.math.BigDecimal;

public class KeywordResult {
    private String keyword;
    private BigDecimal similarityScore;

    public KeywordResult(String keyword, BigDecimal similarityScore) {
        this.keyword = keyword;
        this.similarityScore = similarityScore;
    }

    public String getKeyword() {
        return keyword;
    }
    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
    public BigDecimal getSimilarityScore() {
        return similarityScore;
    }
    public void setSimilarityScore(BigDecimal similarityScore) {
        this.similarityScore = similarityScore;
    }
}
