package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.SchoolRequest;
import com.schoolmanagement.dto.response.SchoolResponse;
import com.schoolmanagement.entity.School;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SchoolService {

    private final SchoolRepository schoolRepository;

    public List<SchoolResponse> getAllSchools() {
        return schoolRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SchoolResponse getSchoolById(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("School", "id", id));
        return toResponse(school);
    }

    public SchoolResponse createSchool(SchoolRequest request) {
        School school = School.builder()
                .name(request.getName())
                .domain(request.getDomain())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .subscription(request.getSubscription() != null ? request.getSubscription() : "trial")
                .maxStudents(request.getMaxStudents() != null ? request.getMaxStudents() : 500)
                .isActive(true)
                .build();
        return toResponse(schoolRepository.save(school));
    }

    public SchoolResponse updateSchool(Long id, SchoolRequest request) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("School", "id", id));

        school.setName(request.getName());
        school.setDomain(request.getDomain());
        school.setContactEmail(request.getContactEmail());
        school.setContactPhone(request.getContactPhone());
        school.setAddress(request.getAddress());
        school.setCity(request.getCity());
        school.setState(request.getState());
        if (request.getSubscription() != null) school.setSubscription(request.getSubscription());
        if (request.getMaxStudents() != null) school.setMaxStudents(request.getMaxStudents());

        return toResponse(schoolRepository.save(school));
    }

    public void deleteSchool(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("School", "id", id));
        school.setIsActive(false);
        schoolRepository.save(school);
    }

    private SchoolResponse toResponse(School school) {
        return SchoolResponse.builder()
                .id(school.getId())
                .name(school.getName())
                .domain(school.getDomain())
                .contactEmail(school.getContactEmail())
                .contactPhone(school.getContactPhone())
                .address(school.getAddress())
                .city(school.getCity())
                .state(school.getState())
                .subscription(school.getSubscription())
                .maxStudents(school.getMaxStudents())
                .isActive(school.getIsActive() != null && school.getIsActive())
                .createdAt(school.getCreatedAt())
                .build();
    }
}
