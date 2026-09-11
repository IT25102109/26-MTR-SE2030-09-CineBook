package com.cinebook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * CineBook - Movie Ticket Booking System
 * SE2030 Group Project (26-MTR-SE2030-09)
 *
 * Entry point for the Spring Boot backend. Run this class (or
 * `mvn spring-boot:run` from the backend/ folder) to start the API
 * on http://localhost:8080
 */
@SpringBootApplication
public class CineBookApplication {

    public static void main(String[] args) {
        SpringApplication.run(CineBookApplication.class, args);
    }

}
