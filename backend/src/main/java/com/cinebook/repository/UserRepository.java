package com.cinebook.repository;

import com.cinebook.model.Role;
import com.cinebook.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmailIgnoreCase(String email);
    long countByRole(Role role);
    Optional<User> findFirstByRole(Role role);
}
