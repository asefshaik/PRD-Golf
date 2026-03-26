package com.golf.platform.repository;

import com.golf.platform.entity.Winner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface WinnerRepository extends JpaRepository<Winner, UUID> {
    List<Winner> findByUserId(UUID userId);
    List<Winner> findByDrawId(UUID drawId);
    List<Winner> findByStatus(String status);
    List<Winner> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
