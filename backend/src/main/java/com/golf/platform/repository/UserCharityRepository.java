package com.golf.platform.repository;

import com.golf.platform.entity.UserCharity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserCharityRepository extends JpaRepository<UserCharity, UUID> {
    Optional<UserCharity> findByUserId(UUID userId);
    Optional<UserCharity> findByUserIdAndCharityId(UUID userId, UUID charityId);
}
