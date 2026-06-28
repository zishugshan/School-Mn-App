package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Leaderboard;
import com.schoolmanagement.entity.enums.LeaderboardCategory;
import com.schoolmanagement.entity.enums.LeaderboardPeriod;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {

    List<Leaderboard> findByCategoryAndPeriodAndYearAndMonthOrderByRankAsc(LeaderboardCategory category, LeaderboardPeriod period, int year, Integer month);

    List<Leaderboard> findByClassEntityIdAndCategoryAndPeriodAndYearAndMonthOrderByRankAsc(Long classId, LeaderboardCategory category, LeaderboardPeriod period, int year, Integer month);

    List<Leaderboard> findByStudentId(Long studentId);

    @Query("SELECT l FROM Leaderboard l WHERE l.category = :category AND l.period = :period AND l.year = :year AND l.month = :month ORDER BY l.score DESC")
    List<Leaderboard> findTop10ByCategoryAndPeriodAndYearAndMonth(@Param("category") LeaderboardCategory category, @Param("period") LeaderboardPeriod period, @Param("year") int year, @Param("month") Integer month, Pageable pageable);
}
