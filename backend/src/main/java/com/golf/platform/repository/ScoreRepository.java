package com.golf.platform.repository;

import com.golf.platform.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScoreRepository extends JpaRepository<Score, UUID> {
    List<Score> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("SELECT s FROM Score s WHERE s.userId = :userId ORDER BY s.createdAt ASC")
    List<Score> findByUserIdOrderByCreatedAtAsc(UUID userId);

    long countByUserId(UUID userId);
}
