package com.golf.platform.service;

import com.golf.platform.dto.CheckoutRequest;
import com.golf.platform.entity.Subscription;
import com.golf.platform.entity.User;
import com.golf.platform.repository.SubscriptionRepository;
import com.golf.platform.repository.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @Value("${stripe.price-id.monthly}")
    private String monthlyPriceId;

    @Value("${stripe.price-id.yearly}")
    private String yearlyPriceId;

    public String createCheckoutSession(UUID userId, CheckoutRequest request) throws StripeException {
        User user = userRepository.findById(userId)
                .orElseGet(() -> {
                    // If user doesn't exist yet, create a placeholder (should be synced but just in
                    // case)
                    User newUser = User.builder()
                            .id(userId)
                            .email(userId.toString() + "@temp.local")
                            .role("user")
                            .build();
                    return userRepository.save(newUser);
                });

        // Get or create Stripe customer
        String customerId = getOrCreateStripeCustomer(userId, user.getEmail());

        // Determine price ID
        String priceId = "yearly".equalsIgnoreCase(request.getPlanType())
                ? yearlyPriceId
                : monthlyPriceId;

        // Create Checkout Session
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setCustomer(customerId)
                .setSuccessUrl(request.getSuccessUrl() + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(request.getCancelUrl())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(priceId)
                                .setQuantity(1L)
                                .build())
                .putMetadata("user_id", userId.toString())
                .putMetadata("plan_type", request.getPlanType())
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    private String getOrCreateStripeCustomer(UUID userId, String email) throws StripeException {
        Optional<Subscription> existingSub = subscriptionRepository.findByUserId(userId);
        if (existingSub.isPresent() && existingSub.get().getStripeCustomerId() != null) {
            return existingSub.get().getStripeCustomerId();
        }

        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(email)
                .putMetadata("user_id", userId.toString())
                .build();

        Customer customer = Customer.create(params);
        return customer.getId();
    }

    public void handleCheckoutCompleted(String customerId, String subscriptionId,
            String planType, UUID userId) {
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElse(Subscription.builder().userId(userId).build());

        subscription.setStripeCustomerId(customerId);
        subscription.setStripeSubscriptionId(subscriptionId);
        subscription.setPlanType(planType);
        subscription.setStatus("active");
        subscription.setCurrentPeriodStart(LocalDateTime.now());

        // Set INR amounts
        if ("yearly".equalsIgnoreCase(planType)) {
            subscription.setCurrentPeriodEnd(LocalDateTime.now().plusYears(1));
            subscription.setAmountInr(new BigDecimal("3299")); // Yearly: 3299 INR
            subscription.setAmount(new BigDecimal("3299").divide(new BigDecimal("85"), 2)); // ~39 USD at 85 INR/USD
        } else {
            subscription.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
            subscription.setAmountInr(new BigDecimal("299")); // Monthly: 299 INR
            subscription.setAmount(new BigDecimal("299").divide(new BigDecimal("85"), 2)); // ~3.5 USD at 85 INR/USD
        }

        subscriptionRepository.save(subscription);
    }

    public void handleSubscriptionUpdated(String stripeSubscriptionId, String status,
            Long periodStart, Long periodEnd) {
        subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId)
                .ifPresent(sub -> {
                    sub.setStatus(status);
                    if (periodStart != null) {
                        sub.setCurrentPeriodStart(
                                LocalDateTime.ofInstant(Instant.ofEpochSecond(periodStart), ZoneId.systemDefault()));
                    }
                    if (periodEnd != null) {
                        sub.setCurrentPeriodEnd(
                                LocalDateTime.ofInstant(Instant.ofEpochSecond(periodEnd), ZoneId.systemDefault()));
                    }
                    subscriptionRepository.save(sub);
                });
    }

    public void handleSubscriptionDeleted(String stripeSubscriptionId) {
        subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId)
                .ifPresent(sub -> {
                    sub.setStatus("cancelled");
                    subscriptionRepository.save(sub);
                });
    }

    public Optional<Subscription> getSubscriptionByUserId(UUID userId) {
        return subscriptionRepository.findByUserId(userId);
    }

    public List<Subscription> getActiveSubscriptions() {
        return subscriptionRepository.findByStatus("active");
    }

    public long getActiveSubscriptionCount() {
        return subscriptionRepository.countByStatus("active");
    }

    public BigDecimal getTotalCharityContributions() {
        return subscriptionRepository.findByStatus("active").stream()
                .map(sub -> {
                    BigDecimal amount = sub.getAmountInr() != null ? sub.getAmountInr() : sub.getAmount();
                    return amount != null ? amount.multiply(new BigDecimal("0.10")) : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
