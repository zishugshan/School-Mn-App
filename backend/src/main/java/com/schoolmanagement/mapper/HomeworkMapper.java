package com.schoolmanagement.mapper;

import com.schoolmanagement.dto.response.HomeworkResponse;
import com.schoolmanagement.entity.Homework;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HomeworkMapper {

    @Mapping(target = "subjectName", source = "subject.name")
    @Mapping(target = "teacherName", expression = "java(homework.getTeacher().getUser().getFirstName() + \" \" + homework.getTeacher().getUser().getLastName())")
    @Mapping(target = "isBroadcast", source = "isBroadcast")
    @Mapping(target = "targetClasses", ignore = true)
    HomeworkResponse toResponse(Homework homework);
}
