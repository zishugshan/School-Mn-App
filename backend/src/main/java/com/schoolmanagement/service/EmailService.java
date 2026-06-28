package com.schoolmanagement.service;

import com.schoolmanagement.entity.Homework;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Test;
import com.schoolmanagement.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@schoolmanagement.com}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
        log.info("Email sent to {} with subject: {}", to, subject);
    }

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("HTML email sent to {} with subject: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }

    public void sendHomeworkNotification(Homework homework, List<User> recipients) {
        String subject = "New Homework: " + homework.getTitle();
        String body = String.format(
                "Dear Student,\n\nNew homework has been assigned.\n\nTitle: %s\nSubject: %s\nDue Date: %s\n\nPlease log in to the system for more details.",
                homework.getTitle(),
                homework.getSubject().getName(),
                homework.getDueDate().toLocalDate()
        );

        for (User recipient : recipients) {
            try {
                sendEmail(recipient.getEmail(), subject, body);
            } catch (Exception e) {
                log.error("Failed to send homework notification to {}: {}", recipient.getEmail(), e.getMessage());
            }
        }
    }

    public void sendAttendanceAlert(Student student, User parent) {
        String subject = "Attendance Alert - " + student.getUser().getFirstName() + " " + student.getUser().getLastName();
        String body = String.format(
                "Dear Parent,\n\nThis is to inform you that your ward %s %s (%s) has been marked absent today.\n\nPlease ensure regular attendance.",
                student.getUser().getFirstName(),
                student.getUser().getLastName(),
                student.getStudentCode()
        );

        try {
            sendEmail(parent.getEmail(), subject, body);
        } catch (Exception e) {
            log.error("Failed to send attendance alert to {}: {}", parent.getEmail(), e.getMessage());
        }
    }

    public void sendTestNotification(Test test, List<User> recipients) {
        String subject = "Upcoming Test: " + test.getTitle();
        String body = String.format(
                "Dear Student,\n\nThis is to inform you about an upcoming test.\n\nTitle: %s\nSubject: %s\nDate: %s\nMaximum Marks: %s\n\nPlease prepare accordingly.",
                test.getTitle(),
                test.getSubject().getName(),
                test.getTestDate(),
                test.getMaximumMarks()
        );

        for (User recipient : recipients) {
            try {
                sendEmail(recipient.getEmail(), subject, body);
            } catch (Exception e) {
                log.error("Failed to send test notification to {}: {}", recipient.getEmail(), e.getMessage());
            }
        }
    }
}
