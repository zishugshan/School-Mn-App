package com.schoolmanagement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "class_teacher")
@IdClass(ClassTeacher.ClassTeacherId.class)
public class ClassTeacher {

    @Id
    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @Id
    @ManyToOne
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    @Id
    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(name = "is_class_teacher")
    private Boolean isClassTeacher;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassTeacherId implements Serializable {
        private Long classEntity;
        private Long section;
        private Long teacher;
    }
}