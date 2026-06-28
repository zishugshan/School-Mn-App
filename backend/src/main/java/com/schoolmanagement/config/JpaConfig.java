package com.schoolmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditAwareImpl")
@EnableTransactionManagement
public class JpaConfig {

    @Bean
    public AuditorAware<Long> auditAwareImpl() {
        return new AuditAwareImpl();
    }
}
