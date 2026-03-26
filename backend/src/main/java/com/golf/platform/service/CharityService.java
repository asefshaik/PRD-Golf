package com.golf.platform.service;

import com.golf.platform.dto.CharityRequest;
import com.golf.platform.entity.Charity;
import com.golf.platform.entity.UserCharity;
import com.golf.platform.repository.CharityRepository;
import com.golf.platform.repository.UserCharityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CharityService {

    private final CharityRepository charityRepository;
    private final UserCharityRepository userCharityRepository;

    public List<Charity> getActiveCharities() {
        return charityRepository.findByIsActiveTrue();
    }

    public List<Charity> getAllCharities() {
        return charityRepository.findAll();
    }

    public Optional<Charity> getCharityById(UUID id) {
        return charityRepository.findById(id);
    }

    public Charity createCharity(CharityRequest request) {
        Charity charity = Charity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .logoUrl(request.getLogoUrl())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return charityRepository.save(charity);
    }

    public Charity updateCharity(UUID id, CharityRequest request) {
        Charity charity = charityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Charity not found"));

        if (request.getName() != null) charity.setName(request.getName());
        if (request.getDescription() != null) charity.setDescription(request.getDescription());
        if (request.getLogoUrl() != null) charity.setLogoUrl(request.getLogoUrl());
        if (request.getIsActive() != null) charity.setIsActive(request.getIsActive());

        return charityRepository.save(charity);
    }

    public void deleteCharity(UUID id) {
        charityRepository.deleteById(id);
    }

    public UserCharity selectCharity(UUID userId, UUID charityId, int contributionPct) {
        if (contributionPct < 10) {
            throw new RuntimeException("Minimum contribution is 10%");
        }

        // Check if charity exists
        charityRepository.findById(charityId)
                .orElseThrow(() -> new RuntimeException("Charity not found"));

        // Update or create user charity selection
        UserCharity userCharity = userCharityRepository.findByUserId(userId)
                .orElse(UserCharity.builder().userId(userId).build());

        userCharity.setCharityId(charityId);
        userCharity.setContributionPct(contributionPct);

        return userCharityRepository.save(userCharity);
    }

    public Optional<UserCharity> getUserCharity(UUID userId) {
        return userCharityRepository.findByUserId(userId);
    }

    public long getCharityCount() {
        return charityRepository.count();
    }
}
