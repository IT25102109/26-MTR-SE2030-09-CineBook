package com.cinebook.dto;

import com.cinebook.model.User;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SendOtpRequest {
        private String target; // Email or Phone number
        private String type;   // "EMAIL" or "PHONE"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VerifyOtpRequest {
        private String target;
        private String code;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OtpResponse {
        private boolean success;
        private String message;
        private String target;
        private String type;
        private String demoCode;
        private int expiresInSeconds;

        @JsonProperty("valid")
        public boolean isValid() {
            return success;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RegisterRequest {
        private String name;
        private String email;

        @JsonAlias({"phone", "phoneNumber"})
        private String phone;

        private String password;

        @JsonAlias({"provider", "authProvider"})
        private String provider; // "EMAIL", "GOOGLE", "MICROSOFT"

        @JsonAlias({"otpCode", "verificationCode", "code"})
        private String otpCode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LoginRequest {
        private String email;
        private String password;

        @JsonAlias({"provider", "authProvider"})
        private String provider; // "EMAIL", "GOOGLE", "MICROSOFT"

        private String name;     // For social login auto-creation if new
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GoogleLoginRequest {
        @JsonAlias({"credential", "token", "accessToken", "access_token"})
        private String idToken;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AuthResponse {
        private boolean success;
        private String message;
        private User user;
        private String token;
    }
}
