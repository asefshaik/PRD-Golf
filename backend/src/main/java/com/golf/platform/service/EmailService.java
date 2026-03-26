package com.golf.platform.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendWelcomeEmail(String to, String name) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Welcome to Golf Platform!");
        message.setText("Hi " + name + ",\n\n" +
                "Welcome to Golf Platform! Your account has been created successfully.\n\n" +
                "Get started by:\n" +
                "1. Choosing your subscription plan\n" +
                "2. Selecting a charity to support\n" +
                "3. Entering your golf scores\n\n" +
                "Good luck in the monthly draws!\n\n" +
                "- Golf Platform Team");
        mailSender.send(message);
    }

    public void sendSubscriptionConfirmation(String to, String planType) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Subscription Confirmed - Golf Platform");
        message.setText("Your " + planType + " subscription has been activated!\n\n" +
                "You're now eligible for monthly draws and prizes.\n\n" +
                "- Golf Platform Team");
        mailSender.send(message);
    }

    public void sendWinnerNotification(String to, String matchType, String prizeAmount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("🎉 Congratulations! You're a Winner!");
        message.setText("Great news!\n\n" +
                "You've won with a " + matchType + "!\n" +
                "Prize amount: $" + prizeAmount + "\n\n" +
                "Please upload your proof to claim your prize.\n\n" +
                "- Golf Platform Team");
        mailSender.send(message);
    }
}
