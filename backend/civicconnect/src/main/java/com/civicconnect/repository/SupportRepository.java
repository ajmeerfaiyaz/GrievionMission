package com.civicconnect.repository;

import com.civicconnect.entity.Support;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupportRepository extends JpaRepository<Support, Long> {

    boolean existsByComplaintIdAndUserId(Long complaintId, Long userId);

    Optional<Support> findByComplaintIdAndUserId(Long complaintId, Long userId);

    long countByComplaintId(Long complaintId);
}
