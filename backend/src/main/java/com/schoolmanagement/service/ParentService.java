package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.RegisterParentRequest;
import com.schoolmanagement.dto.request.UpdateParentRequest;
import com.schoolmanagement.dto.response.StudentResponse;
import com.schoolmanagement.entity.Parent;
import com.schoolmanagement.entity.Role;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.exception.DuplicateResourceException;
import com.schoolmanagement.exception.BadRequestException;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.mapper.StudentMapper;
import com.schoolmanagement.repository.ParentRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ParentService {

    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final PasswordEncoder passwordEncoder;

    public Parent createParentWithUser(UpdateParentRequest request) {
        if (request.getEmail() != null) {
            var existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent()) {
                var existingParent = parentRepository.findByUserId(existingUser.get().getId());
                if (existingParent.isPresent()) {
                    Parent parent = existingParent.get();
                    if (request.getStudentIds() != null) {
                        List<Student> students = studentRepository.findAllById(request.getStudentIds());
                        parent.getStudents().addAll(students);
                    }
                    return parentRepository.save(parent);
                }
                throw new DuplicateResourceException("Email already registered to a non-parent user");
            }
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode("password123"))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(Role.PARENT)
                .isActive(true)
                .isLocked(false)
                .build();
        user = userRepository.save(user);

        Parent parent = Parent.builder()
                .user(user)
                .occupation(request.getOccupation())
                .address(request.getAddress())
                .relationship(request.getRelationship())
                .students(new HashSet<>())
                .build();

        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            List<Student> students = studentRepository.findAllById(request.getStudentIds());
            parent.getStudents().addAll(students);
        }

        return parentRepository.save(parent);
    }

    public Parent registerParent(RegisterParentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        if (user.getRole() != Role.PARENT) {
            throw new BadRequestException("User role must be PARENT to register as a parent");
        }

        Parent parent = Parent.builder()
                .user(user)
                .occupation(request.getOccupation())
                .address(request.getAddress())
                .relationship(request.getRelationship())
                .students(new HashSet<>())
                .build();

        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            List<Student> students = studentRepository.findAllById(request.getStudentIds());
            parent.getStudents().addAll(students);
        }

        return parentRepository.save(parent);
    }

    public Parent updateParent(Long id, UpdateParentRequest request) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent", "id", id));
        User user = parent.getUser();

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            var existingUserOpt = userRepository.findByEmail(request.getEmail());
            if (existingUserOpt.isPresent()) {
                var existingParent = parentRepository.findByUserId(existingUserOpt.get().getId());
                if (existingParent.isPresent()) {
                    Parent target = existingParent.get();
                    if (request.getStudentIds() != null) {
                        List<Student> students = studentRepository.findAllById(request.getStudentIds());
                        target.getStudents().addAll(students);
                    } else {
                        target.getStudents().addAll(parent.getStudents());
                    }
                    parentRepository.save(target);
                    parent.getStudents().clear();
                    parentRepository.delete(parent);
                    userRepository.delete(user);
                    return target;
                }
                throw new DuplicateResourceException("Email already in use by another user");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getOccupation() != null) parent.setOccupation(request.getOccupation());
        if (request.getAddress() != null) parent.setAddress(request.getAddress());
        if (request.getRelationship() != null) parent.setRelationship(request.getRelationship());

        if (request.getStudentIds() != null) {
            List<Student> students = studentRepository.findAllById(request.getStudentIds());
            parent.getStudents().clear();
            parent.getStudents().addAll(students);
        }

        userRepository.save(user);
        return parentRepository.save(parent);
    }

    public Parent getParentById(Long id) {
        return parentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent", "id", id));
    }

    public Parent getParentByUserId(Long userId) {
        return parentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent", "userId", userId));
    }

    public List<StudentResponse> getStudentsByParentId(Long parentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent", "id", parentId));
        return parent.getStudents().stream()
                .map(studentMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<Parent> getAllParents() {
        return parentRepository.findAll();
    }

    public List<Parent> getParentsByStudentId(Long studentId) {
        return parentRepository.findByStudentsId(studentId);
    }

    public void linkStudent(Long parentId, Long studentId) {
        linkStudentToParent(parentId, studentId);
    }

    public void linkStudentToParent(Long parentId, Long studentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent", "id", parentId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        parent.getStudents().add(student);
        parentRepository.save(parent);
    }

    public void unlinkStudentFromParent(Long parentId, Long studentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent", "id", parentId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        parent.getStudents().remove(student);
        parentRepository.save(parent);
    }

}
