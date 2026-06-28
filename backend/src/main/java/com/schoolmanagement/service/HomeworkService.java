package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.HomeworkDoubtRequest;
import com.schoolmanagement.dto.request.HomeworkRequest;
import com.schoolmanagement.dto.request.HomeworkSubmissionRequest;
import com.schoolmanagement.dto.response.HomeworkDoubtResponse;
import com.schoolmanagement.dto.response.HomeworkResponse;
import com.schoolmanagement.dto.response.HomeworkSubmissionResponse;
import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.Homework;
import com.schoolmanagement.entity.HomeworkDoubt;
import com.schoolmanagement.entity.HomeworkSubmission;
import com.schoolmanagement.entity.HomeworkTarget;
import com.schoolmanagement.entity.Section;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.entity.enums.HomeworkStatus;
import com.schoolmanagement.exception.BadRequestException;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.HomeworkDoubtRepository;
import com.schoolmanagement.repository.HomeworkRepository;
import com.schoolmanagement.repository.HomeworkSubmissionRepository;
import com.schoolmanagement.repository.HomeworkTargetRepository;
import com.schoolmanagement.repository.SectionRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.SubjectRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class HomeworkService {

    private final HomeworkRepository homeworkRepository;
    private final HomeworkSubmissionRepository homeworkSubmissionRepository;
    private final HomeworkTargetRepository homeworkTargetRepository;
    private final HomeworkDoubtRepository homeworkDoubtRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final SectionRepository sectionRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    public HomeworkResponse createHomework(HomeworkRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getTeacherId()));

        Homework homework = Homework.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .subject(subject)
                .teacher(teacher)
                .dueDate(request.getDueDate())
                .maxScore(request.getMaxScore())
                .attachmentUrl(request.getAttachmentUrl())
                .isBroadcast(request.getIsBroadcast() != null ? request.getIsBroadcast() : false)
                .broadcastLevel(request.getBroadcastLevel())
                .build();

        homework = homeworkRepository.save(homework);

        if (request.getTargets() != null) {
            for (HomeworkRequest.HomeworkTargetEntry target : request.getTargets()) {
                HomeworkTarget homeworkTarget = HomeworkTarget.builder()
                        .homework(homework)
                        .build();

                if (target.getClassId() != null) {
                    ClassEntity classEntity = entityManager.find(ClassEntity.class, target.getClassId());
                    if (classEntity == null) {
                        throw new ResourceNotFoundException("Class", "id", target.getClassId());
                    }
                    homeworkTarget.setClassEntity(classEntity);
                }
                if (target.getSectionId() != null) {
                    Section section = sectionRepository.findById(target.getSectionId())
                            .orElseThrow(() -> new ResourceNotFoundException("Section", "id", target.getSectionId()));
                    homeworkTarget.setSection(section);
                }
                if (target.getStudentId() != null) {
                    Student student = studentRepository.findById(target.getStudentId())
                            .orElseThrow(() -> new ResourceNotFoundException("Student", "id", target.getStudentId()));
                    homeworkTarget.setStudent(student);
                }

                homeworkTargetRepository.save(homeworkTarget);
            }
        }

        return toResponse(homework);
    }

    @Transactional(readOnly = true)
    public List<HomeworkResponse> getHomeworkByTeacher(Long teacherId) {
        return homeworkRepository.findByTeacherId(teacherId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HomeworkResponse> getHomeworkByStudent(Long studentId) {
        return homeworkRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HomeworkResponse> getHomeworkByClass(Long classId) {
        return homeworkRepository.findByClassId(classId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HomeworkResponse getHomeworkById(Long id) {
        Homework homework = homeworkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homework", "id", id));
        return toResponse(homework);
    }

    public HomeworkResponse updateHomework(Long id, HomeworkRequest request) {
        Homework homework = homeworkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homework", "id", id));

        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));
            homework.setSubject(subject);
        }

        homework.setTitle(request.getTitle());
        homework.setDescription(request.getDescription());
        homework.setDueDate(request.getDueDate());
        homework.setMaxScore(request.getMaxScore());
        homework.setAttachmentUrl(request.getAttachmentUrl());
        homework.setIsBroadcast(request.getIsBroadcast() != null ? request.getIsBroadcast() : false);
        homework.setBroadcastLevel(request.getBroadcastLevel());

        homework = homeworkRepository.save(homework);

        if (request.getTargets() != null) {
            homeworkTargetRepository.deleteByHomeworkId(homework.getId());
            for (HomeworkRequest.HomeworkTargetEntry target : request.getTargets()) {
                HomeworkTarget homeworkTarget = HomeworkTarget.builder()
                        .homework(homework)
                        .build();

                if (target.getClassId() != null) {
                    ClassEntity classEntity = entityManager.find(ClassEntity.class, target.getClassId());
                    if (classEntity == null) {
                        throw new ResourceNotFoundException("Class", "id", target.getClassId());
                    }
                    homeworkTarget.setClassEntity(classEntity);
                }
                if (target.getSectionId() != null) {
                    Section section = sectionRepository.findById(target.getSectionId())
                            .orElseThrow(() -> new ResourceNotFoundException("Section", "id", target.getSectionId()));
                    homeworkTarget.setSection(section);
                }
                if (target.getStudentId() != null) {
                    Student student = studentRepository.findById(target.getStudentId())
                            .orElseThrow(() -> new ResourceNotFoundException("Student", "id", target.getStudentId()));
                    homeworkTarget.setStudent(student);
                }

                homeworkTargetRepository.save(homeworkTarget);
            }
        }

        return toResponse(homework);
    }

    public void deleteHomework(Long id) {
        Homework homework = homeworkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homework", "id", id));
        homeworkTargetRepository.deleteByHomeworkId(id);
        homeworkRepository.delete(homework);
    }

    public HomeworkSubmissionResponse submitHomework(HomeworkSubmissionRequest request) {
        Homework homework = homeworkRepository.findById(request.getHomeworkId())
                .orElseThrow(() -> new ResourceNotFoundException("Homework", "id", request.getHomeworkId()));
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));

        HomeworkSubmission existing = homeworkSubmissionRepository
                .findByHomeworkIdAndStudentId(request.getHomeworkId(), request.getStudentId())
                .orElse(null);

        if (existing != null) {
            throw new BadRequestException("Homework already submitted by this student");
        }

        HomeworkSubmission submission = HomeworkSubmission.builder()
                .homework(homework)
                .student(student)
                .submissionText(request.getSubmissionText())
                .attachmentUrl(request.getAttachmentUrl())
                .status(HomeworkStatus.SUBMITTED)
                .submittedAt(LocalDateTime.now())
                .build();

        submission = homeworkSubmissionRepository.save(submission);
        return toSubmissionResponse(submission);
    }

    @Transactional(readOnly = true)
    public List<HomeworkSubmissionResponse> getSubmissionsByHomework(Long homeworkId) {
        return homeworkSubmissionRepository.findByHomeworkId(homeworkId).stream()
                .map(this::toSubmissionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HomeworkSubmissionResponse> getSubmissionsByStudent(Long studentId) {
        return homeworkSubmissionRepository.findByStudentId(studentId).stream()
                .map(this::toSubmissionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HomeworkSubmissionResponse> getSubmissionsByStudentAndStatus(Long studentId, HomeworkStatus status) {
        return homeworkSubmissionRepository.findByStudentIdAndStatus(studentId, status).stream()
                .map(this::toSubmissionResponse)
                .collect(Collectors.toList());
    }

    public HomeworkSubmissionResponse gradeSubmission(Long submissionId, BigDecimal score, String feedback) {
        HomeworkSubmission submission = homeworkSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "id", submissionId));

        submission.setScore(score);
        submission.setFeedback(feedback);
        submission.setStatus(HomeworkStatus.COMPLETED);
        submission.setGradedAt(LocalDateTime.now());

        submission = homeworkSubmissionRepository.save(submission);
        return toSubmissionResponse(submission);
    }

    // ── Doubt methods ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<HomeworkDoubtResponse> getDoubtsByHomework(Long homeworkId) {
        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework", "id", homeworkId));
        List<HomeworkDoubt> topLevel = homeworkDoubtRepository
                .findByHomeworkIdAndParentDoubtIsNullOrderByCreatedAtAsc(homeworkId);
        return topLevel.stream().map(this::toDoubtResponse).collect(Collectors.toList());
    }

    public HomeworkDoubtResponse createDoubt(HomeworkDoubtRequest request, Long homeworkId) {
        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework", "id", homeworkId));
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getSenderId()));

        HomeworkDoubt doubt = HomeworkDoubt.builder()
                .homework(homework)
                .sender(sender)
                .senderRole(sender.getRole().name())
                .message(request.getMessage())
                .isResolved(false)
                .build();

        if (request.getParentDoubtId() != null) {
            HomeworkDoubt parent = homeworkDoubtRepository.findById(request.getParentDoubtId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doubt", "id", request.getParentDoubtId()));
            doubt.setParentDoubt(parent);
        }

        doubt = homeworkDoubtRepository.save(doubt);
        return toDoubtResponse(doubt);
    }

    public HomeworkDoubtResponse resolveDoubt(Long doubtId) {
        HomeworkDoubt doubt = homeworkDoubtRepository.findById(doubtId)
                .orElseThrow(() -> new ResourceNotFoundException("Doubt", "id", doubtId));
        doubt.setIsResolved(true);
        doubt = homeworkDoubtRepository.save(doubt);
        return toDoubtResponse(doubt);
    }

    private HomeworkDoubtResponse toDoubtResponse(HomeworkDoubt doubt) {
        List<HomeworkDoubtResponse> replies = Collections.emptyList();
        List<HomeworkDoubt> children = homeworkDoubtRepository
                .findByHomeworkIdOrderByCreatedAtAsc(doubt.getHomework().getId());
        List<HomeworkDoubt> directReplies = children.stream()
                .filter(c -> c.getParentDoubt() != null && c.getParentDoubt().getId().equals(doubt.getId()))
                .collect(Collectors.toList());
        if (!directReplies.isEmpty()) {
            replies = directReplies.stream().map(this::toDoubtResponseFlat).collect(Collectors.toList());
        }

        return HomeworkDoubtResponse.builder()
                .id(doubt.getId())
                .homeworkId(doubt.getHomework().getId())
                .senderId(doubt.getSender().getId())
                .senderName(doubt.getSender().getFirstName() + " " + doubt.getSender().getLastName())
                .senderRole(doubt.getSenderRole())
                .message(doubt.getMessage())
                .parentDoubtId(doubt.getParentDoubt() != null ? doubt.getParentDoubt().getId() : null)
                .isResolved(doubt.getIsResolved())
                .createdAt(doubt.getCreatedAt())
                .replies(replies)
                .build();
    }

    private HomeworkDoubtResponse toDoubtResponseFlat(HomeworkDoubt doubt) {
        return HomeworkDoubtResponse.builder()
                .id(doubt.getId())
                .homeworkId(doubt.getHomework().getId())
                .senderId(doubt.getSender().getId())
                .senderName(doubt.getSender().getFirstName() + " " + doubt.getSender().getLastName())
                .senderRole(doubt.getSenderRole())
                .message(doubt.getMessage())
                .parentDoubtId(doubt.getParentDoubt() != null ? doubt.getParentDoubt().getId() : null)
                .isResolved(doubt.getIsResolved())
                .createdAt(doubt.getCreatedAt())
                .replies(Collections.emptyList())
                .build();
    }

    private HomeworkResponse toResponse(Homework homework) {
        List<HomeworkTarget> targets = homeworkTargetRepository.findByHomeworkId(homework.getId());
        List<String> targetClasses = targets.stream()
                .map(t -> {
                    if (t.getClassEntity() != null) {
                        return t.getClassEntity().getName();
                    }
                    return null;
                })
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        List<Long> targetClassIds = targets.stream()
                .map(t -> {
                    if (t.getClassEntity() != null) {
                        return t.getClassEntity().getId();
                    }
                    return null;
                })
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        List<Long> targetSectionIds = targets.stream()
                .map(t -> {
                    if (t.getSection() != null) {
                        return t.getSection().getId();
                    }
                    return null;
                })
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        List<String> targetSectionNames = targets.stream()
                .map(t -> {
                    if (t.getSection() != null) {
                        return t.getSection().getName();
                    }
                    return null;
                })
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        return HomeworkResponse.builder()
                .id(homework.getId())
                .title(homework.getTitle())
                .description(homework.getDescription())
                .subjectName(homework.getSubject().getName())
                .teacherId(homework.getTeacher().getUser().getId())
                .teacherName(homework.getTeacher().getUser().getFirstName() + " " + homework.getTeacher().getUser().getLastName())
                .dueDate(homework.getDueDate())
                .maxScore(homework.getMaxScore())
                .attachmentUrl(homework.getAttachmentUrl())
                .isBroadcast(homework.getIsBroadcast() != null && homework.getIsBroadcast())
                .targetClasses(targetClasses)
                .targetClassIds(targetClassIds)
                .targetSectionNames(targetSectionNames)
                .targetSectionIds(targetSectionIds)
                .createdAt(homework.getCreatedAt())
                .build();
    }

    private HomeworkSubmissionResponse toSubmissionResponse(HomeworkSubmission submission) {
        return HomeworkSubmissionResponse.builder()
                .id(submission.getId())
                .homeworkId(submission.getHomework().getId())
                .homeworkTitle(submission.getHomework().getTitle())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getUser().getFirstName() + " " + submission.getStudent().getUser().getLastName())
                .studentCode(submission.getStudent().getStudentCode())
                .submissionText(submission.getSubmissionText())
                .attachmentUrl(submission.getAttachmentUrl())
                .score(submission.getScore())
                .feedback(submission.getFeedback())
                .status(submission.getStatus().name())
                .submittedAt(submission.getSubmittedAt())
                .gradedAt(submission.getGradedAt())
                .build();
    }
}
