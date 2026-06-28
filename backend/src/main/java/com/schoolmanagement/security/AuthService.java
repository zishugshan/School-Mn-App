package com.schoolmanagement.security;

import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.Section;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.StudentClass;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.entity.enums.Gender;
import com.schoolmanagement.repository.ClassRepository;
import com.schoolmanagement.repository.SectionRepository;
import com.schoolmanagement.repository.StudentClassRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.repository.UserRepository;
import com.schoolmanagement.service.StudentCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final StudentCodeGenerator studentCodeGenerator;
    private final StudentClassRepository studentClassRepository;
    private final SectionRepository sectionRepository;
    private final ClassRepository classRepository;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    public AuthController.JwtResponse authenticate(AuthController.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String accessToken = jwtTokenProvider.generateToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        saveRefreshToken(userDetails, refreshToken);

        return buildJwtResponse(userDetails, accessToken, refreshToken);
    }

    @Transactional
    public AuthController.JwtResponse register(AuthController.RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .role(request.role())
                .isActive(true)
                .isLocked(false)
                .build();

        user = userRepository.save(user);

        if (request.role() == com.schoolmanagement.entity.Role.STUDENT) {
            String studentCode = studentCodeGenerator.generateStudentCode();
            Student student = Student.builder()
                    .user(user)
                    .studentCode(studentCode)
                    .dateOfBirth(LocalDate.now())
                    .gender(Gender.OTHER)
                    .admissionDate(LocalDate.now())
                    .build();
            student = studentRepository.save(student);

            if (request.classId() != null && request.sectionId() != null) {
                String className = request.classId().trim();
                ClassEntity classEntity = classRepository.findByName(className)
                        .orElseGet(() -> classRepository.findByCode("CLS-" + className)
                                .orElseGet(() -> {
                                    ClassEntity newClass = ClassEntity.builder()
                                            .name(className)
                                            .code("CLS-" + className)
                                            .description("Class " + className)
                                            .isActive(true)
                                            .build();
                                    return classRepository.save(newClass);
                                }));
                Long cid = classEntity.getId();
                String sectionName = request.sectionId().trim().toUpperCase();
                Section section = sectionRepository.findByClassEntityIdAndName(cid, sectionName)
                        .orElseGet(() -> {
                            Section newSection = Section.builder()
                                    .classEntity(classEntity)
                                    .name(sectionName)
                                    .code("SEC-" + cid + "-" + sectionName)
                                    .capacity(40)
                                    .isActive(true)
                                    .build();
                            return sectionRepository.save(newSection);
                        });
                int year = LocalDate.now().getYear();
                String academicYear = year + "-" + ((year + 1) % 100);

                StudentClass studentClass = StudentClass.builder()
                        .student(student)
                        .classEntity(classEntity)
                        .section(section)
                        .academicYear(academicYear)
                        .isActive(true)
                        .build();
                studentClassRepository.save(studentClass);
            }
        } else if (request.role() == com.schoolmanagement.entity.Role.TEACHER) {
            Teacher teacher = Teacher.builder()
                    .user(user)
                    .teacherCode("TCH" + System.currentTimeMillis())
                    .qualification("")
                    .dateOfBirth(LocalDate.now())
                    .gender(com.schoolmanagement.entity.enums.Gender.OTHER)
                    .dateJoined(LocalDate.now())
                    .build();
            teacherRepository.save(teacher);
        }

        CustomUserDetails userDetails = buildUserDetails(user);
        String accessToken = jwtTokenProvider.generateToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        saveRefreshToken(userDetails, refreshToken);

        return buildJwtResponse(userDetails, accessToken, refreshToken);
    }

    @Transactional
    public AuthController.JwtResponse refreshToken(String token) {
        RefreshToken refreshTokenEntity = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if (Boolean.TRUE.equals(refreshTokenEntity.getIsRevoked())) {
            throw new RuntimeException("Refresh token has been revoked");
        }

        if (refreshTokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token has expired");
        }

        User user = refreshTokenEntity.getUser();
        CustomUserDetails userDetails = buildUserDetails(user);
        String newAccessToken = jwtTokenProvider.generateToken(userDetails);

        return buildJwtResponse(userDetails, newAccessToken, token);
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String resetToken = jwtTokenProvider.generatePasswordResetToken(email);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset Request");
        message.setText("To reset your password, use the following token: " + resetToken);
        mailSender.send(message);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (!jwtTokenProvider.validatePasswordResetToken(token)) {
            throw new RuntimeException("Invalid or expired password reset token");
        }

        String email = jwtTokenProvider.getEmailFromPasswordResetToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        RefreshToken tokenEntity = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
        tokenEntity.setIsRevoked(true);
        refreshTokenRepository.save(tokenEntity);
    }

    private void saveRefreshToken(CustomUserDetails userDetails, String token) {
        User user = userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plus(Duration.ofMillis(refreshExpirationMs)))
                .isRevoked(false)
                .build();

        refreshTokenRepository.save(refreshTokenEntity);
    }

    private CustomUserDetails buildUserDetails(User user) {
        return CustomUserDetails.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .password(user.getPassword())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .isActive(user.getIsActive() != null && user.getIsActive())
                .isLocked(user.getIsLocked() != null && user.getIsLocked())
                .build();
    }

    private AuthController.JwtResponse buildJwtResponse(CustomUserDetails userDetails,
                                                        String accessToken,
                                                        String refreshToken) {
        return AuthController.JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(userDetails.getUserId())
                .email(userDetails.getEmail())
                .role(userDetails.getRole().name())
                .firstName(userDetails.getFirstName())
                .lastName(userDetails.getLastName())
                .build();
    }
}
