package com.schoolmanagement.service;

import com.schoolmanagement.dto.response.ModuleResponse;
import com.schoolmanagement.entity.Role;
import com.schoolmanagement.exception.BadRequestException;
import com.schoolmanagement.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ModuleService {

    public ModuleResponse getModuleStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new BadRequestException("User not authenticated");
        }

        Role role = userDetails.getRole();
        Map<String, Boolean> modules = new LinkedHashMap<>();

        modules.put("dashboard", true);
        modules.put("profile", true);
        modules.put("attendance", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN || role == Role.TEACHER);
        modules.put("homework", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN || role == Role.TEACHER || role == Role.STUDENT);
        modules.put("tests", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN || role == Role.TEACHER || role == Role.STUDENT);
        modules.put("marks", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN || role == Role.TEACHER || role == Role.STUDENT || role == Role.PARENT);
        modules.put("timetable", true);
        modules.put("calendar", true);
        modules.put("events", true);
        modules.put("fees", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN || role == Role.STUDENT || role == Role.PARENT);
        modules.put("transport", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN || role == Role.STUDENT || role == Role.PARENT);
        modules.put("library", true);
        modules.put("houses", true);
        modules.put("chat", true);
        modules.put("goals", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN || role == Role.TEACHER || role == Role.STUDENT);
        modules.put("certificates", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN || role == Role.TEACHER || role == Role.STUDENT);
        modules.put("remarks", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN || role == Role.TEACHER);
        modules.put("analytics", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN);
        modules.put("auditLogs", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN);
        modules.put("userManagement", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN);
        modules.put("upload", role == Role.SUPER_ADMIN || role == Role.SCHOOL_ADMIN || role == Role.TEACHER);

        return ModuleResponse.builder()
                .modules(modules)
                .role(role.name())
                .build();
    }
}
