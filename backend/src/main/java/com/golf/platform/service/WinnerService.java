package com.golf.platform.service;

import com.golf.platform.entity.Winner;
import com.golf.platform.repository.WinnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WinnerService {

    private final WinnerRepository winnerRepository;

    public List<Winner> getUserWinnings(UUID userId) {
        return winnerRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Winner uploadProof(UUID winnerId, String proofImageUrl) {
        Winner winner = winnerRepository.findById(winnerId)
                .orElseThrow(() -> new RuntimeException("Winner record not found"));

        winner.setProofImageUrl(proofImageUrl);
        return winnerRepository.save(winner);
    }

    public Winner verifyWinner(UUID winnerId, boolean approved) {
        Winner winner = winnerRepository.findById(winnerId)
                .orElseThrow(() -> new RuntimeException("Winner record not found"));

        if (approved) {
            winner.setStatus("verified");
        } else {
            winner.setStatus("rejected");
        }
        winner.setVerifiedAt(LocalDateTime.now());
        return winnerRepository.save(winner);
    }

    public Winner markAsPaid(UUID winnerId) {
        Winner winner = winnerRepository.findById(winnerId)
                .orElseThrow(() -> new RuntimeException("Winner record not found"));

        winner.setStatus("paid");
        return winnerRepository.save(winner);
    }

    public List<Winner> getPendingVerifications() {
        return winnerRepository.findByStatus("pending");
    }

    public long getPendingCount() {
        return winnerRepository.findByStatus("pending").size();
    }

    public long getVerifiedWinnersCount() {
        return winnerRepository.findByStatus("verified").size();
    }

    public long getPaidWinnersCount() {
        return winnerRepository.findByStatus("paid").size();
    }

    public List<Winner> getAllWinners() {
        return winnerRepository.findAll();
    }
}
