package com.cinebook.dto;

import com.cinebook.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendOtpRequest {
        private String target; // Email or Phone number
        private String type;   // "EMAIL" or "PHONE"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyOtpRequest {
        private String target;
        private String code;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OtpResponse {
        private boolean success;
        private String message;
        private String target;
        private String type;
        private String demoCode;
        private int expiresInSeconds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        private String name;
        private String email;
        private String phone;
        private String password;
        private String provider; // "EMAIL", "GOOGLE", "MICROSOFT"
        private String otpCode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
        private String provider; // "EMAIL", "GOOGLE", "MICROSOFT"
        private String name;     // For social login auto-creation if new
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private boolean success;
        private String message;
        private User user;
        private String token;
    }
}
