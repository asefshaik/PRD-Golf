package com.golf.platform.service;

import com.golf.platform.entity.*;
import com.golf.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TestDataService {

    private final UserRepository userRepository;
    private final ScoreRepository scoreRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CharityRepository charityRepository;

    /**
     * Generate 15 test users with subscriptions, scores, and charity selections
     */
    public Map<String, Object> generateTestData() {
        List<User> createdUsers = new ArrayList<>();
        List<Subscription> createdSubscriptions = new ArrayList<>();
        List<Score> createdScores = new ArrayList<>();

        // Create 15 test users
        for (int i = 1; i <= 15; i++) {
            UUID userId = UUID.randomUUID();
            String email = "testuser" + i + "@golfplatform.com";

            User user = User.builder()
                    .id(userId)
                    .email(email)
                    .fullName("Test User " + i)
                    .role("user")
                    .charityContributionPct(10)
                    .build();

            userRepository.save(user);
            createdUsers.add(user);

            // Create subscription (alternating monthly/yearly)
            String planType = i % 2 == 0 ? "yearly" : "monthly";
            BigDecimal amountInr = "yearly".equals(planType) ? new BigDecimal("3299") : new BigDecimal("299");

            Subscription sub = Subscription.builder()
                    .userId(userId)
                    .planType(planType)
                    .status("active")
                    .amount(amountInr.divide(new BigDecimal("85"), 2)) // Convert to USD at ~85 INR/USD
                    .amountInr(amountInr)
                    .currentPeriodStart(LocalDateTime.now())
                    .currentPeriodEnd(LocalDateTime.now().plusMonths("yearly".equals(planType) ? 12 : 1))
                    .build();

            subscriptionRepository.save(sub);
            createdSubscriptions.add(sub);

            // Create 5 random golf scores (1-45) for each user
            Random random = new Random(i); // Seeded for reproducibility
            for (int j = 0; j < 5; j++) {
                int scoreValue = random.nextInt(45) + 1; // 1-45
                Score score = Score.builder()
                        .userId(userId)
                        .scoreValue(scoreValue)
                        .playedAt(LocalDateTime.now().minusDays(5 - j))
                        .build();
                scoreRepository.save(score);
                createdScores.add(score);
            }
        }

        // Get or create charities for user selection
        List<Charity> charities = charityRepository.findAll();
        if (charities.isEmpty()) {
            // Create default charities
            charities = createDefaultCharities();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("usersCreated", createdUsers.size());
        result.put("subscriptionsCreated", createdSubscriptions.size());
        result.put("scoresCreated", createdScores.size());
        result.put("users", createdUsers.stream().map(u -> Map.of(
                "id", u.getId(),
                "email", u.getEmail(),
                "fullName", u.getFullName()
        )).toList());
        result.put("totalUsersInDatabase", userRepository.count());
        result.put("totalActiveSubscriptions", subscriptionRepository.findAll().stream()
                .filter(s -> "active".equals(s.getStatus()))
                .count());
        result.put("totalScoresCreated", scoreRepository.count());

        return result;
    }

    /**
     * Create default charities for testing
     */
    private List<Charity> createDefaultCharities() {
        List<Charity> charities = new ArrayList<>();

        String[] charityNames = {
                "World Wildlife Fund",
                "Doctors Without Borders",
                "UNICEF",
                "Water.org",
                "GiveDirectly"
        };

        for (String name : charityNames) {
            Charity charity = Charity.builder()
                    .id(UUID.randomUUID())
                    .name(name)
                    .description("Supporting " + name + " through golf platform contributions")
                    .logoUrl("https://via.placeholder.com/200")
                    .build();
            charityRepository.save(charity);
            charities.add(charity);
        }

        return charities;
    }

    /**
     * Clear all test data
     */
    public Map<String, String> clearTestData() {
        long deletedScores = scoreRepository.count();
        scoreRepository.deleteAll();

        long deletedSubs = subscriptionRepository.count();
        subscriptionRepository.deleteAll();

        long deletedUsers = userRepository.count();
        userRepository.deleteAll();

        Map<String, String> result = new HashMap<>();
        result.put("scoresDeleted", String.valueOf(deletedScores));
        result.put("subscriptionsDeleted", String.valueOf(deletedSubs));
        result.put("usersDeleted", String.valueOf(deletedUsers));

        return result;
    }
}
