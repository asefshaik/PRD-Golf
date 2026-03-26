package com.golf.platform.repository;

import com.golf.platform.entity.Charity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CharityRepository extends JpaRepository<Charity, UUID> {
    List<Charity> findByIsActiveTrue();
}
