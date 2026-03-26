package com.golf.platform.service;

import com.golf.platform.entity.*;
import com.golf.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DrawService {

    private final DrawRepository drawRepository;
    private final ScoreRepository scoreRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final WinnerRepository winnerRepository;
    private final UserRepository userRepository;
    private final DrawResultRepository drawResultRepository;

    private static final int DRAW_SIZE = 5; // 5 numbers drawn
    private static final int MIN_NUMBER = 1;
    private static final int MAX_NUMBER = 45;

    // Prize distribution percentages
    private static final BigDecimal FIVE_MATCH_PCT = new BigDecimal("0.40");
    private static final BigDecimal FOUR_MATCH_PCT = new BigDecimal("0.35");
    private static final BigDecimal THREE_MATCH_PCT = new BigDecimal("0.25");

    public Draw executeDraw(LocalDate drawDate, BigDecimal prizePool, String drawType) {
        // Generate draw numbers
        List<Integer> drawnNumbers = "weighted".equalsIgnoreCase(drawType)
                ? generateWeightedNumbers()
                : generateRandomNumbers();

        Collections.sort(drawnNumbers);

        Draw draw = Draw.builder()
                .drawDate(drawDate != null ? drawDate : LocalDate.now())
                .drawNumbers(drawnNumbers.stream().map(String::valueOf).collect(Collectors.joining(",")))
                .prizePool(prizePool != null ? prizePool : calculatePrizePool())
                .status("completed")
                .build();

        draw = drawRepository.save(draw);

        // Find winners
        findAndSaveWinners(draw, drawnNumbers);

        return draw;
    }

    public Draw simulateDraw(String drawType) {
        List<Integer> drawnNumbers = "weighted".equalsIgnoreCase(drawType)
                ? generateWeightedNumbers()
                : generateRandomNumbers();
        Collections.sort(drawnNumbers);

        // Don't save - just return simulation
        return Draw.builder()
                .drawDate(LocalDate.now())
                .drawNumbers(drawnNumbers.stream().map(String::valueOf).collect(Collectors.joining(",")))
                .prizePool(calculatePrizePool())
                .status("simulated")
                .build();
    }

    private List<Integer> generateRandomNumbers() {
        List<Integer> numbers = new ArrayList<>();
        Random random = new Random();
        Set<Integer> used = new HashSet<>();

        while (numbers.size() < DRAW_SIZE) {
            int num = random.nextInt(MAX_NUMBER - MIN_NUMBER + 1) + MIN_NUMBER;
            if (used.add(num)) {
                numbers.add(num);
            }
        }
        return numbers;
    }

    private List<Integer> generateWeightedNumbers() {
        // Weighted by score frequency - numbers that appear more often as scores get
        // higher weight
        Map<Integer, Integer> frequency = new HashMap<>();
        List<Score> allScores = scoreRepository.findAll();

        for (Score s : allScores) {
            frequency.merge(s.getScoreValue(), 1, Integer::sum);
        }

        // If no scores exist, fall back to random
        if (frequency.isEmpty()) {
            return generateRandomNumbers();
        }

        // Build weighted pool
        List<Integer> weightedPool = new ArrayList<>();
        for (Map.Entry<Integer, Integer> entry : frequency.entrySet()) {
            for (int i = 0; i < entry.getValue(); i++) {
                weightedPool.add(entry.getKey());
            }
        }
        // Add all numbers at least once for fairness
        for (int i = MIN_NUMBER; i <= MAX_NUMBER; i++) {
            weightedPool.add(i);
        }

        Collections.shuffle(weightedPool);

        Set<Integer> used = new HashSet<>();
        List<Integer> result = new ArrayList<>();
        for (int num : weightedPool) {
            if (used.add(num)) {
                result.add(num);
                if (result.size() == DRAW_SIZE)
                    break;
            }
        }

        // Fill remaining if needed
        Random random = new Random();
        while (result.size() < DRAW_SIZE) {
            int num = random.nextInt(MAX_NUMBER - MIN_NUMBER + 1) + MIN_NUMBER;
            if (used.add(num)) {
                result.add(num);
            }
        }

        return result;
    }

    private void findAndSaveWinners(Draw draw, List<Integer> drawnNumbers) {
        Set<Integer> drawnSet = new HashSet<>(drawnNumbers);
        List<User> users = userRepository.findAll();

        // Count 5-match, 4-match, 3-match winners
        List<Winner> fiveMatch = new ArrayList<>();
        List<Winner> fourMatch = new ArrayList<>();
        List<Winner> threeMatch = new ArrayList<>();

        for (User user : users) {
            List<Score> scores = scoreRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            Set<Integer> userScoreSet = scores.stream()
                    .map(Score::getScoreValue)
                    .collect(Collectors.toSet());

            long matches = userScoreSet.stream().filter(drawnSet::contains).count();

            if (matches >= 5) {
                fiveMatch.add(createWinner(draw, user, "5-match"));
            } else if (matches == 4) {
                fourMatch.add(createWinner(draw, user, "4-match"));
            } else if (matches == 3) {
                threeMatch.add(createWinner(draw, user, "3-match"));
            }
        }

        BigDecimal pool = draw.getPrizePool();

        // Distribute prizes
        distributePrizes(fiveMatch, pool.multiply(FIVE_MATCH_PCT));
        distributePrizes(fourMatch, pool.multiply(FOUR_MATCH_PCT));
        distributePrizes(threeMatch, pool.multiply(THREE_MATCH_PCT));

        // Save all winners
        List<Winner> allWinners = new ArrayList<>();
        allWinners.addAll(fiveMatch);
        allWinners.addAll(fourMatch);
        allWinners.addAll(threeMatch);
        winnerRepository.saveAll(allWinners);
    }

    private Winner createWinner(Draw draw, User user, String matchType) {
        return Winner.builder()
                .drawId(draw.getId())
                .userId(user.getId())
                .matchType(matchType)
                .status("pending")
                .build();
    }

    private void distributePrizes(List<Winner> winners, BigDecimal totalPrize) {
        if (winners.isEmpty())
            return;
        BigDecimal perWinner = totalPrize.divide(
                new BigDecimal(winners.size()), 2, RoundingMode.HALF_UP);
        winners.forEach(w -> w.setPrizeAmount(perWinner));
    }

    private BigDecimal calculatePrizePool() {
        long activeSubs = subscriptionRepository.countByStatus("active");
        // Assume $10 per subscription contributes to pool
        return new BigDecimal(activeSubs).multiply(new BigDecimal("10.00"));
    }

    public List<Draw> getAllDraws() {
        return drawRepository.findAllByOrderByDrawDateDesc();
    }

    public Optional<Draw> getDrawById(UUID id) {
        return drawRepository.findById(id);
    }

    public List<Winner> getDrawWinners(UUID drawId) {
        return winnerRepository.findByDrawId(drawId);
    }

    public long getDrawCount() {
        return drawRepository.count();
    }

    public BigDecimal getTotalPrizePool() {
        return drawRepository.findAll().stream()
                .map(Draw::getPrizePool)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Draw saveDraw(Draw draw) {
        return drawRepository.save(draw);
    }

    public List<DrawResult> getDrawResults(UUID drawId) {
        return drawResultRepository.findByDrawId(drawId);
    }
}
