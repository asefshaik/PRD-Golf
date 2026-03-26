package com.golf.platform.controller;

import com.golf.platform.service.SubscriptionService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WebhookController {

    private final SubscriptionService subscriptionService;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        // If webhook secret is not configured, just acknowledge
        if ("TO_BE_ADDED_LATER".equals(webhookSecret) || webhookSecret == null || webhookSecret.isEmpty()) {
            return ResponseEntity.ok("Webhook endpoint ready but not configured yet");
        }

        if (sigHeader == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing Stripe-Signature header");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        // Handle event types
        switch (event.getType()) {
            case "checkout.session.completed":
                handleCheckoutSessionCompleted(event);
                break;
            case "invoice.payment_succeeded":
                // Handle recurring payment success
                break;
            case "customer.subscription.updated":
                handleSubscriptionUpdated(event);
                break;
            case "customer.subscription.deleted":
                handleSubscriptionDeleted(event);
                break;
            default:
                System.out.println("Unhandled event type: " + event.getType());
        }

        return ResponseEntity.ok("Event processed");
    }

    private void handleCheckoutSessionCompleted(Event event) {
        try {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject().orElse(null);
            if (session != null) {
                String userId = session.getMetadata().get("user_id");
                String planType = session.getMetadata().get("plan_type");
                subscriptionService.handleCheckoutCompleted(
                        session.getCustomer(),
                        session.getSubscription(),
                        planType,
                        UUID.fromString(userId)
                );
            }
        } catch (Exception e) {
            System.err.println("Error handling checkout.session.completed: " + e.getMessage());
        }
    }

    private void handleSubscriptionUpdated(Event event) {
        try {
            com.stripe.model.Subscription subscription = (com.stripe.model.Subscription)
                    event.getDataObjectDeserializer().getObject().orElse(null);
            if (subscription != null) {
                subscriptionService.handleSubscriptionUpdated(
                        subscription.getId(),
                        subscription.getStatus(),
                        subscription.getCurrentPeriodStart(),
                        subscription.getCurrentPeriodEnd()
                );
            }
        } catch (Exception e) {
            System.err.println("Error handling customer.subscription.updated: " + e.getMessage());
        }
    }

    private void handleSubscriptionDeleted(Event event) {
        try {
            com.stripe.model.Subscription subscription = (com.stripe.model.Subscription)
                    event.getDataObjectDeserializer().getObject().orElse(null);
            if (subscription != null) {
                subscriptionService.handleSubscriptionDeleted(subscription.getId());
            }
        } catch (Exception e) {
            System.err.println("Error handling customer.subscription.deleted: " + e.getMessage());
        }
    }
}
