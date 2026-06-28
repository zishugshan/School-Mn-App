package com.schoolmanagement.service;

import com.schoolmanagement.dto.response.HouseResponse;
import com.schoolmanagement.entity.House;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.StudentRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HouseService {

    @PersistenceContext
    private EntityManager entityManager;

    private final StudentRepository studentRepository;

    public List<HouseResponse> getAllHouses() {
        List<House> houses = entityManager.createQuery("SELECT h FROM House h", House.class).getResultList();
        return houses.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public HouseResponse getHouseById(Long id) {
        House house = entityManager.createQuery(
                "SELECT h FROM House h WHERE h.id = :id", House.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("House", "id", id));
        return toResponse(house);
    }

    public List<Map<String, Object>> getHouseLeaderboard(Long id) {
        House house = entityManager.createQuery(
                "SELECT h FROM House h WHERE h.id = :id", House.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("House", "id", id));

        List<Student> students = studentRepository.findByHouseId(id);
        List<Student> sorted = students.stream()
                .sorted((a, b) -> {
                    int aPoints = a.getTotalPoints() != null ? a.getTotalPoints() : 0;
                    int bPoints = b.getTotalPoints() != null ? b.getTotalPoints() : 0;
                    return Integer.compare(bPoints, aPoints);
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> leaderboard = new ArrayList<>();
        int rank = 1;
        for (Student student : sorted) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("rank", rank++);
            entry.put("studentId", student.getId());
            entry.put("studentName", student.getUser().getFirstName() + " " + student.getUser().getLastName());
            entry.put("studentCode", student.getStudentCode());
            entry.put("totalPoints", student.getTotalPoints() != null ? student.getTotalPoints() : 0);
            leaderboard.add(entry);
        }

        return leaderboard;
    }

    public List<Map<String, Object>> getAllHousesLeaderboard() {
        List<House> houses = entityManager.createQuery("SELECT h FROM House h", House.class).getResultList();

        List<Map<String, Object>> leaderboard = new ArrayList<>();
        for (House house : houses) {
            long studentCount = studentRepository.countByHouseId(house.getId());
            int totalPoints = studentRepository.findByHouseId(house.getId()).stream()
                    .mapToInt(s -> s.getTotalPoints() != null ? s.getTotalPoints() : 0)
                    .sum();

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("houseId", house.getId());
            entry.put("houseName", house.getName().name());
            entry.put("colorCode", house.getColorCode());
            entry.put("motto", house.getMotto());
            entry.put("totalStudents", studentCount);
            entry.put("totalPoints", totalPoints);
            leaderboard.add(entry);
        }

        leaderboard.sort((a, b) -> Integer.compare((int) b.get("totalPoints"), (int) a.get("totalPoints")));

        int rank = 1;
        for (Map<String, Object> entry : leaderboard) {
            entry.put("rank", rank++);
        }

        return leaderboard;
    }

    private HouseResponse toResponse(House house) {
        long studentCount = studentRepository.countByHouseId(house.getId());
        List<Student> students = studentRepository.findByHouseId(house.getId());

        String captainName = null;
        String viceCaptainName = null;

        return HouseResponse.builder()
                .id(house.getId())
                .name(house.getName().name())
                .color(house.getColorCode())
                .motto(house.getMotto())
                .totalStudents((int) studentCount)
                .totalPoints(students.stream().mapToInt(s -> s.getTotalPoints() != null ? s.getTotalPoints() : 0).sum())
                .captainName(captainName)
                .viceCaptainName(viceCaptainName)
                .build();
    }
}
