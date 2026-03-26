package com.golf.platform.repository;

import com.golf.platform.entity.DrawResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DrawResultRepository extends JpaRepository<DrawResult, UUID> {
    List<DrawResult> findByDrawId(UUID drawId);

    List<DrawResult> findByUserIdAndDrawId(UUID userId, UUID drawId);

    List<DrawResult> findByDrawIdOrderByMatchedCountDesc(UUID drawId);

    List<DrawResult> findByMatchType(String matchType);
}
