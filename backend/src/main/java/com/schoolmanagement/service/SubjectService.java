package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.SubjectRequest;
import com.schoolmanagement.dto.response.SubjectResponse;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.exception.DuplicateResourceException;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.SubjectRepository;
import com.schoolmanagement.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;

    public SubjectResponse createSubject(SubjectRequest request) {
        if (subjectRepository.findByCode(request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Subject already exists with code: " + request.getCode());
        }

        Subject subject = Subject.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .isActive(true)
                .build();

        return toResponse(subjectRepository.save(subject));
    }

    public SubjectResponse getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        return toResponse(subject);
    }

    public List<SubjectResponse> getAllSubjects() {
        return subjectRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SubjectResponse updateSubject(Long id, SubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));

        subject.setName(request.getName());
        subject.setCode(request.getCode());
        subject.setDescription(request.getDescription());

        return toResponse(subjectRepository.save(subject));
    }

    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        subject.setIsActive(false);
        subjectRepository.save(subject);
    }

    private SubjectResponse toResponse(Subject subject) {
        List<String> teacherNames = teacherRepository.findBySubjectId(subject.getId()).stream()
                .map(t -> t.getUser().getFirstName() + " " + t.getUser().getLastName())
                .collect(Collectors.toList());
        return SubjectResponse.builder()
                .id(subject.getId())
                .name(subject.getName())
                .code(subject.getCode())
                .description(subject.getDescription())
                .isActive(subject.getIsActive() != null && subject.getIsActive())
                .teacherNames(teacherNames)
                .build();
    }
}
