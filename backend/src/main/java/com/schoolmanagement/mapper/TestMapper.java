package com.schoolmanagement.mapper;

import com.schoolmanagement.dto.response.TestResponse;
import com.schoolmanagement.entity.Test;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TestMapper {

    @Mapping(target = "subjectName", source = "subject.name")
    @Mapping(target = "className", source = "classEntity.name")
    @Mapping(target = "sectionName", expression = "java(test.getSection() != null ? test.getSection().getName() : null)")
    @Mapping(target = "teacherName", expression = "java(test.getTeacher().getUser().getFirstName() + \" \" + test.getTeacher().getUser().getLastName())")
    @Mapping(target = "isPublished", source = "isPublished")
    @Mapping(target = "examType", expression = "java(test.getExamType() != null ? test.getExamType().name() : null)")
    TestResponse toResponse(Test test);
}
