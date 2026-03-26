package com.golf.platform.service;

import com.golf.platform.entity.*;
import com.golf.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DrawLogicService {

    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository;
    private final DrawResultRepository drawResultRepository;
    private final SubscriptionRepository subscriptionRepository;

    private static final int DRAW_SIZE = 5;
    private static final int MIN_NUMBER = 1;
    private static final int MAX_NUMBER = 45;

    // Prize distribution - INR based
    private static final BigDecimal FIVE_MATCH_PCT = new BigDecimal("0.40");
    private static final BigDecimal FOUR_MATCH_PCT = new BigDecimal("0.35");
    private static final BigDecimal THREE_MATCH_PCT = new BigDecimal("0.25");

    // Standard subscription prices in INR
    private static final BigDecimal MONTHLY_PRICE_INR = new BigDecimal("299");
    private static final BigDecimal YEARLY_PRICE_INR = new BigDecimal("3299");

    /**
     * Generate random draw numbers (1-45, 5 unique numbers)
     */
    public List<Integer> generateRandomNumbers() {
        List<Integer> numbers = new ArrayList<>();
        Random random = new Random();
        Set<Integer> used = new HashSet<>();

        while (numbers.size() < DRAW_SIZE) {
            int num = random.nextInt(MAX_NUMBER - MIN_NUMBER + 1) + MIN_NUMBER;
            if (used.add(num)) {
                numbers.add(num);
            }
        }
        Collections.sort(numbers);
        return numbers;
    }

    /**
     * Generate weighted numbers based on frequency of user scores
     * Numbers that appear more often as golf scores get higher weight
     */
    public List<Integer> generateWeightedNumbers() {
        Map<Integer, Long> frequency = scoreRepository.findAll().stream()
                .collect(Collectors.groupingByConcurrent(Score::getScoreValue, Collectors.counting()));

        if (frequency.isEmpty()) {
            return generateRandomNumbers();
        }

        // Build weighted pool - higher frequency = more copies
        List<Integer> weightedPool = new ArrayList<>();
        for (Map.Entry<Integer, Long> entry : frequency.entrySet()) {
            int count = Math.min((int) (entry.getValue() / 2) + 1, 10); // Cap contribution
            for (int i = 0; i < count; i++) {
                weightedPool.add(entry.getKey());
            }
        }

        // Draw 5 unique numbers from weighted pool
        Set<Integer> drawn = new HashSet<>();
        Random random = new Random();
        while (drawn.size() < DRAW_SIZE && !weightedPool.isEmpty()) {
            int idx = random.nextInt(weightedPool.size());
            drawn.add(weightedPool.get(idx));
        }

        List<Integer> result = new ArrayList<>(drawn);
        Collections.sort(result);
        return result;
    }

    /**
     * Calculate total active prize pool from all active subscriptions
     */
    public BigDecimal calculatePrizePool() {
        List<Subscription> activeSubscriptions = subscriptionRepository.findAll().stream()
                .filter(s -> "active".equals(s.getStatus()))
                .toList();

        BigDecimal totalPool = BigDecimal.ZERO;

        for (Subscription sub : activeSubscriptions) {
            // Each subscription contributes its price to the pool
            BigDecimal contribution = sub.getAmountInr() != null ? sub.getAmountInr()
                    : ("monthly".equalsIgnoreCase(sub.getPlanType()) ? MONTHLY_PRICE_INR : YEARLY_PRICE_INR);
            totalPool = totalPool.add(contribution);
        }

        return totalPool;
    }

    /**
     * Execute draw logic: match user scores with drawn numbers
     * Find winners and store results
     */
    public Map<String, Object> executeDraw(List<Integer> drawnNumbers, BigDecimal prizePool, Draw draw) {
        Set<Integer> drawnSet = new HashSet<>(drawnNumbers);
        Map<String, List<DrawResult>> resultsByMatchType = new HashMap<>();
        resultsByMatchType.put("5-match", new ArrayList<>());
        resultsByMatchType.put("4-match", new ArrayList<>());
        resultsByMatchType.put("3-match", new ArrayList<>());

        List<User> activeUsers = userRepository.findAll().stream()
                .filter(u -> {
                    List<Subscription> subs = subscriptionRepository.findAll().stream()
                            .filter(s -> u.getId().equals(s.getUserId()) && "active".equals(s.getStatus()))
                            .toList();
                    return !subs.isEmpty();
                })
                .toList();

        // Check each user's last 5 scores
        for (User user : activeUsers) {
            List<Score> userScores = scoreRepository.findAll().stream()
                    .filter(s -> user.getId().equals(s.getUserId()))
                    .sorted(Comparator.comparing(Score::getPlayedAt).reversed())
                    .limit(5)
                    .toList();

            if (userScores.isEmpty())
                continue;

            Set<Integer> userScoreSet = new HashSet<>(userScores.stream()
                    .map(Score::getScoreValue)
                    .collect(Collectors.toList()));

            // Find matches
            Set<Integer> matchedScores = new HashSet<>(userScoreSet);
            matchedScores.retainAll(drawnSet);

            if (matchedScores.size() >= 3) {
                String matchType = switch (matchedScores.size()) {
                    case 5 -> "5-match";
                    case 4 -> "4-match";
                    default -> "3-match";
                };

                DrawResult result = DrawResult.builder()
                        .drawId(draw.getId())
                        .userId(user.getId())
                        .userScores(userScores.stream()
                                .map(s -> String.valueOf(s.getScoreValue()))
                                .collect(Collectors.joining(",")))
                        .matchedCount(matchedScores.size())
                        .matchedScores(matchedScores.stream()
                                .sorted()
                                .map(String::valueOf)
                                .collect(Collectors.joining(",")))
                        .matchType(matchType)
                        .build();

                drawResultRepository.save(result);
                resultsByMatchType.get(matchType).add(result);
            }
        }

        // Calculate pool distributions
        Map<String, BigDecimal> poolDistribution = new HashMap<>();
        poolDistribution.put("5-match", prizePool.multiply(FIVE_MATCH_PCT).setScale(2, RoundingMode.HALF_UP));
        poolDistribution.put("4-match", prizePool.multiply(FOUR_MATCH_PCT).setScale(2, RoundingMode.HALF_UP));
        poolDistribution.put("3-match", prizePool.multiply(THREE_MATCH_PCT).setScale(2, RoundingMode.HALF_UP));

        // Update draw entity with pool distribution
        draw.setFiveMatchPool(poolDistribution.get("5-match"));
        draw.setFourMatchPool(poolDistribution.get("4-match"));
        draw.setThreeMatchPool(poolDistribution.get("3-match"));

        Map<String, Object> result = new HashMap<>();
        result.put("drawnNumbers", drawnNumbers);
        result.put("prizePool", prizePool);
        result.put("poolDistribution", poolDistribution);
        result.put("results", resultsByMatchType);
        result.put("totalWinners", resultsByMatchType.values().stream()
                .mapToLong(List::size)
                .sum());

        return result;
    }

    /**
     * Calculate prize amount for winners in a match tier
     */
    public BigDecimal calculatePrizePerWinner(BigDecimal tierPool, int winnerCount) {
        if (winnerCount == 0)
            return BigDecimal.ZERO;
        return tierPool.divide(new BigDecimal(winnerCount), 2, RoundingMode.HALF_UP);
    }
}
