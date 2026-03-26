package com.golf.platform.service;

import com.golf.platform.dto.AuthSyncRequest;
import com.golf.platform.entity.User;
import com.golf.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User syncUser(AuthSyncRequest request) {
        Optional<User> existing = userRepository.findById(request.getId());
        if (existing.isPresent()) {
            User user = existing.get();
            user.setEmail(request.getEmail());
            if (request.getFullName() != null) {
                user.setFullName(request.getFullName());
            }
            return userRepository.save(user);
        }

        User newUser = User.builder()
                .id(request.getId())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .role("user")
                .charityContributionPct(10)
                .build();
        return userRepository.save(newUser);
    }

    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(UUID id, User updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.getFullName() != null) user.setFullName(updates.getFullName());
        if (updates.getCharityContributionPct() != null) {
            if (updates.getCharityContributionPct() < 10) {
                throw new RuntimeException("Minimum charity contribution is 10%");
            }
            user.setCharityContributionPct(updates.getCharityContributionPct());
        }
        return userRepository.save(user);
    }

    public long getUserCount() {
        return userRepository.count();
    }
}
