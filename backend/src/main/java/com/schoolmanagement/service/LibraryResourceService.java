package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.LibraryResourceRequest;
import com.schoolmanagement.dto.response.LibraryResourceResponse;
import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.LibraryResource;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.LibraryResourceRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LibraryResourceService {

    private final LibraryResourceRepository repository;
    private final EntityManager entityManager;

    private static final List<String> ADMIN_ROLES = List.of("SUPER_ADMIN", "SCHOOL_ADMIN");

    @Transactional(readOnly = true)
    public List<LibraryResourceResponse> getAllResources() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LibraryResourceResponse> getResourcesByCategory(String category) {
        return repository.findByCategoryOrderByCreatedAtDesc(category).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LibraryResourceResponse> getResourcesByClass(Long classId) {
        return repository.findByClassEntityIdOrderByCreatedAtDesc(classId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LibraryResourceResponse> searchResources(String query) {
        return repository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(query).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public LibraryResourceResponse createResource(LibraryResourceRequest request, Long userId) {
        User user = entityManager.find(User.class, userId);
        if (user == null) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        LibraryResource.LibraryResourceBuilder builder = LibraryResource.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .resourceType(request.getResourceType())
                .url(request.getUrl())
                .category(request.getCategory())
                .uploadedBy(user);

        if (request.getClassId() != null) {
            ClassEntity classEntity = entityManager.find(ClassEntity.class, request.getClassId());
            if (classEntity == null) {
                throw new ResourceNotFoundException("Class", "id", request.getClassId());
            }
            builder.classEntity(classEntity);
        }

        LibraryResource resource = repository.save(builder.build());
        return toResponse(resource);
    }

    public void deleteResource(Long id, Long userId, String role) {
        LibraryResource resource = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LibraryResource", "id", id));

        boolean isAdmin = ADMIN_ROLES.contains(role);

        if (!isAdmin && !resource.getUploadedBy().getId().equals(userId)) {
            throw new com.schoolmanagement.exception.UnauthorizedException("You can only delete your own resources");
        }

        repository.delete(resource);
    }

    private LibraryResourceResponse toResponse(LibraryResource resource) {
        return LibraryResourceResponse.builder()
                .id(resource.getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .resourceType(resource.getResourceType())
                .url(resource.getUrl())
                .category(resource.getCategory())
                .classId(resource.getClassEntity() != null ? resource.getClassEntity().getId() : null)
                .className(resource.getClassEntity() != null ? resource.getClassEntity().getName() : null)
                .uploadedById(resource.getUploadedBy().getId())
                .uploadedByRole(resource.getUploadedBy().getRole().name())
                .uploadedByName(resource.getUploadedBy().getFirstName() + " " + resource.getUploadedBy().getLastName())
                .createdAt(resource.getCreatedAt())
                .build();
    }
}
