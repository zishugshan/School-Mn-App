package com.schoolmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GamificationResponse {

    private int totalPoints;
    private int badgesCount;
    private int achievementsCount;
    private int currentStreak;
    private int longestStreak;
    private List<BadgeResponse> badges;
    private List<AchievementResponse> achievements;
    private List<StreakResponse> streaks;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BadgeResponse {
        private Long id;
        private String name;
        private String description;
        private String iconUrl;
        private LocalDate earnedDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AchievementResponse {
        private Long id;
        private String name;
        private String description;
        private String iconUrl;
        private LocalDate achievedDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StreakResponse {
        private String streakType;
        private int currentCount;
        private int longestCount;
        private LocalDate lastActiveDate;
    }
}
