package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.ClassRequest;
import com.schoolmanagement.dto.response.ClassResponse;
import com.schoolmanagement.dto.response.SectionResponse;
import com.schoolmanagement.entity.ClassTeacher;
import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.Section;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.exception.DuplicateResourceException;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.ClassRepository;
import com.schoolmanagement.repository.ClassTeacherRepository;
import com.schoolmanagement.repository.SectionRepository;
import com.schoolmanagement.repository.SubjectRepository;
import com.schoolmanagement.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ClassService {

    private final ClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final ClassTeacherRepository classTeacherRepository;

    public ClassResponse createClass(ClassRequest request) {
        if (classRepository.findByCode(request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Class already exists with code: " + request.getCode());
        }

        ClassEntity classEntity = ClassEntity.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .isActive(true)
                .build();

        return toResponse(classRepository.save(classEntity));
    }

    public ClassResponse getClassById(Long id) {
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));
        return toResponse(classEntity);
    }

    public List<ClassResponse> getAllClasses() {
        return classRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ClassResponse updateClass(Long id, ClassRequest request) {
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));

        classEntity.setName(request.getName());
        classEntity.setCode(request.getCode());
        classEntity.setDescription(request.getDescription());

        return toResponse(classRepository.save(classEntity));
    }

    public void deleteClass(Long id) {
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));
        classEntity.setIsActive(false);
        classRepository.save(classEntity);
    }

    public List<SectionResponse> getSectionsByClassId(Long classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));

        return sectionRepository.findByClassEntityIdAndIsActiveTrue(classId).stream()
                .map(section -> SectionResponse.builder()
                        .id(section.getId())
                        .classId(classEntity.getId())
                        .className(classEntity.getName())
                        .name(section.getName())
                        .code(section.getCode())
                        .roomNumber(section.getRoomNumber())
                        .capacity(section.getCapacity())
                        .isActive(section.getIsActive())
                        .build())
                .collect(Collectors.toList());
    }

    public void assignTeacher(Long classId, Long sectionId, Long teacherId, boolean isClassTeacher) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", sectionId));
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));

        ClassTeacher.ClassTeacherId pk = new ClassTeacher.ClassTeacherId(classId, sectionId, teacherId);
        if (classTeacherRepository.existsById(pk)) {
            ClassTeacher ct = classTeacherRepository.findById(pk).orElseThrow();
            ct.setIsClassTeacher(isClassTeacher);
            classTeacherRepository.save(ct);
        } else {
            ClassTeacher ct = ClassTeacher.builder()
                    .classEntity(classEntity)
                    .section(section)
                    .teacher(teacher)
                    .isClassTeacher(isClassTeacher)
                    .build();
            classTeacherRepository.save(ct);
        }
    }

    public void assignSubject(Long classId, Long subjectId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", subjectId));

        // Would need a ClassSubject entity to persist this relationship
    }

    public void removeSubject(Long classId, Long subjectId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", subjectId));

        // Would need a ClassSubject entity to remove this relationship
    }

    private ClassResponse toResponse(ClassEntity entity) {
        List<SectionResponse> sectionResponses = sectionRepository.findByClassEntityIdAndIsActiveTrue(entity.getId())
                .stream()
                .map(section -> SectionResponse.builder()
                        .id(section.getId())
                        .classId(section.getClassEntity().getId())
                        .className(entity.getName())
                        .name(section.getName())
                        .code(section.getCode())
                        .capacity(section.getCapacity())
                        .isActive(section.getIsActive())
                        .build())
                .collect(Collectors.toList());
        String classTeacherName = null;
        List<ClassTeacher> classTeachers = classTeacherRepository.findByClassEntityId(entity.getId());
        Optional<ClassTeacher> ctOpt = classTeachers.stream()
                .filter(ct -> Boolean.TRUE.equals(ct.getIsClassTeacher()))
                .findFirst();
        if (ctOpt.isPresent()) {
            Teacher t = ctOpt.get().getTeacher();
            if (t.getUser() != null) {
                classTeacherName = t.getUser().getFirstName() + " " + t.getUser().getLastName();
            }
        }
        return ClassResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .sections(sectionResponses)
                .classTeacherName(classTeacherName)
                .isActive(entity.getIsActive())
                .build();
    }
}
