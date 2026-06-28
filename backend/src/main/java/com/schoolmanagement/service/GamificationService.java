package com.schoolmanagement.service;

import com.schoolmanagement.dto.response.GamificationResponse;
import com.schoolmanagement.entity.Achievement;
import com.schoolmanagement.entity.Badge;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.StudentBadge;
import com.schoolmanagement.entity.StudentStreak;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.AchievementRepository;
import com.schoolmanagement.repository.BadgeRepository;
import com.schoolmanagement.repository.StudentBadgeRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.StudentStreakRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GamificationService {

    private final StudentRepository studentRepository;
    private final BadgeRepository badgeRepository;
    private final StudentBadgeRepository studentBadgeRepository;
    private final AchievementRepository achievementRepository;
    private final StudentStreakRepository studentStreakRepository;

    public void awardBadge(Long studentId, Long badgeId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge", "id", badgeId));

        if (studentBadgeRepository.existsByStudentIdAndBadgeId(studentId, badgeId)) {
            return;
        }

        StudentBadge studentBadge = StudentBadge.builder()
                .student(student)
                .badge(badge)
                .awardedAt(LocalDateTime.now())
                .build();

        studentBadgeRepository.save(studentBadge);

        if (badge.getPoints() != null) {
            student.setTotalPoints(student.getTotalPoints() != null
                    ? student.getTotalPoints() + badge.getPoints()
                    : badge.getPoints());
            studentRepository.save(student);
        }
    }

    public void checkAndAwardBadges(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        List<Badge> allBadges = badgeRepository.findAll();
        long achievementCount = achievementRepository.countByStudentId(studentId);
        int totalPoints = student.getTotalPoints() != null ? student.getTotalPoints() : 0;

        StudentStreak streak = studentStreakRepository.findByStudentId(studentId).orElse(null);
        int attendanceStreak = streak != null ? streak.getCurrentAttendanceStreak() : 0;
        int homeworkStreak = streak != null ? streak.getCurrentHomeworkStreak() : 0;

        for (Badge badge : allBadges) {
            if (studentBadgeRepository.existsByStudentIdAndBadgeId(studentId, badge.getId())) {
                continue;
            }

            boolean qualifies = evaluateBadgeCriteria(badge, achievementCount, totalPoints,
                    attendanceStreak, homeworkStreak);

            if (qualifies) {
                awardBadge(studentId, badge.getId());
            }
        }
    }

    private boolean evaluateBadgeCriteria(Badge badge, long achievementCount, int totalPoints,
                                          int attendanceStreak, int homeworkStreak) {
        String criteria = badge.getCriteria();
        if (criteria == null) return false;

        return switch (criteria.toLowerCase()) {
            case "first_achievement" -> achievementCount >= 1;
            case "five_achievements" -> achievementCount >= 5;
            case "ten_achievements" -> achievementCount >= 10;
            case "100_points" -> totalPoints >= 100;
            case "500_points" -> totalPoints >= 500;
            case "1000_points" -> totalPoints >= 1000;
            case "perfect_attendance_week" -> attendanceStreak >= 5;
            case "perfect_attendance_month" -> attendanceStreak >= 20;
            case "homework_streak_5" -> homeworkStreak >= 5;
            case "homework_streak_10" -> homeworkStreak >= 10;
            default -> false;
        };
    }

    public Achievement addAchievement(Long studentId, String title, String description, int points) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        Achievement achievement = Achievement.builder()
                .student(student)
                .title(title)
                .description(description)
                .points(points)
                .achievedAt(LocalDateTime.now())
                .build();

        Achievement saved = achievementRepository.save(achievement);

        student.setTotalPoints(student.getTotalPoints() != null
                ? student.getTotalPoints() + points
                : points);
        studentRepository.save(student);

        return saved;
    }

    public void updateStreak(Long studentId) {
        StudentStreak streak = studentStreakRepository.findByStudentId(studentId)
                .orElseGet(() -> StudentStreak.builder()
                        .student(studentRepository.findById(studentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId)))
                        .currentAttendanceStreak(0)
                        .maxAttendanceStreak(0)
                        .currentHomeworkStreak(0)
                        .maxHomeworkStreak(0)
                        .build());

        LocalDate today = LocalDate.now();

        if (streak.getLastAttendanceDate() != null) {
            if (streak.getLastAttendanceDate().equals(today.minusDays(1))) {
                streak.setCurrentAttendanceStreak(streak.getCurrentAttendanceStreak() + 1);
            } else if (!streak.getLastAttendanceDate().equals(today)) {
                streak.setCurrentAttendanceStreak(0);
            }
        } else {
            streak.setCurrentAttendanceStreak(Math.max(streak.getCurrentAttendanceStreak(), 1));
        }

        streak.setMaxAttendanceStreak(Math.max(
                streak.getMaxAttendanceStreak(), streak.getCurrentAttendanceStreak()));
        streak.setLastAttendanceDate(today);

        studentStreakRepository.save(streak);
    }

    public int getStudentPoints(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        return student.getTotalPoints() != null ? student.getTotalPoints() : 0;
    }

    public List<GamificationResponse.BadgeResponse> getStudentBadges(Long studentId) {
        return studentBadgeRepository.findByStudentId(studentId).stream()
                .map(sb -> GamificationResponse.BadgeResponse.builder()
                        .id(sb.getBadge().getId())
                        .name(sb.getBadge().getName())
                        .description(sb.getBadge().getDescription())
                        .iconUrl(sb.getBadge().getIconUrl())
                        .earnedDate(sb.getAwardedAt() != null ? sb.getAwardedAt().toLocalDate() : null)
                        .build())
                .collect(Collectors.toList());
    }

    public List<GamificationResponse.AchievementResponse> getStudentAchievements(Long studentId) {
        return achievementRepository.findByStudentId(studentId).stream()
                .map(a -> GamificationResponse.AchievementResponse.builder()
                        .id(a.getId())
                        .name(a.getTitle())
                        .description(a.getDescription())
                        .achievedDate(a.getAchievedAt() != null ? a.getAchievedAt().toLocalDate() : null)
                        .build())
                .collect(Collectors.toList());
    }

    public List<GamificationResponse.StreakResponse> getStudentStreaks(Long studentId) {
        StudentStreak streak = studentStreakRepository.findByStudentId(studentId).orElse(null);
        if (streak == null) {
            return List.of();
        }
        return List.of(
                GamificationResponse.StreakResponse.builder()
                        .streakType("ATTENDANCE")
                        .currentCount(streak.getCurrentAttendanceStreak() != null ? streak.getCurrentAttendanceStreak() : 0)
                        .longestCount(streak.getMaxAttendanceStreak() != null ? streak.getMaxAttendanceStreak() : 0)
                        .lastActiveDate(streak.getLastAttendanceDate())
                        .build(),
                GamificationResponse.StreakResponse.builder()
                        .streakType("HOMEWORK")
                        .currentCount(streak.getCurrentHomeworkStreak() != null ? streak.getCurrentHomeworkStreak() : 0)
                        .longestCount(streak.getMaxHomeworkStreak() != null ? streak.getMaxHomeworkStreak() : 0)
                        .lastActiveDate(streak.getLastHomeworkDate())
                        .build()
        );
    }

    public List<Map<String, Object>> getGamificationLeaderboard() {
        return studentRepository.findByUserIsActiveTrue().stream()
                .sorted((a, b) -> {
                    int pa = a.getTotalPoints() != null ? a.getTotalPoints() : 0;
                    int pb = b.getTotalPoints() != null ? b.getTotalPoints() : 0;
                    return Integer.compare(pb, pa);
                })
                .limit(20)
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("studentId", s.getId());
                    map.put("studentCode", s.getStudentCode());
                    map.put("studentName", s.getUser().getFirstName() + " " + s.getUser().getLastName());
                    map.put("totalPoints", s.getTotalPoints() != null ? s.getTotalPoints() : 0);
                    return map;
                })
                .collect(Collectors.toList());
    }
}
