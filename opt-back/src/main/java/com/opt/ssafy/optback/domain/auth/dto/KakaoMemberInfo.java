package com.opt.ssafy.optback.domain.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class KakaoMemberInfo {
    @JsonProperty("id")
    private String id;

    @JsonProperty("kakao_account")
    private KakaoAccount kakaoAccount;

    public String getEmail() {
        return kakaoAccount.getEmail();
    }

    public String getProfileImageUrl() {
        return kakaoAccount.getProfile().getProfileImageUrl();
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KakaoAccount {
        private String email;

        @JsonProperty("profile")
        private Profile profile;
    }

    @Getter
    public static class Profile {

        @JsonProperty("profile_image_url")
        private String profileImageUrl;
    }

}
