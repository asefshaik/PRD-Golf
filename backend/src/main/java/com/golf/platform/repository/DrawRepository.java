package com.golf.platform.repository;

import com.golf.platform.entity.Draw;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DrawRepository extends JpaRepository<Draw, UUID> {
    List<Draw> findAllByOrderByDrawDateDesc();
    List<Draw> findByStatus(String status);
}
