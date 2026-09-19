package com.civicconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * CivicConnect - Spring Boot Main Application
 * 
 * In Phase 3, Spring Data JPA automatically connects to MySQL
 * and creates/updates entity tables ('users', 'complaints', 'supports', 'comments').
 */
@SpringBootApplication
public class CivicConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CivicConnectApplication.class, args);
    }

}
