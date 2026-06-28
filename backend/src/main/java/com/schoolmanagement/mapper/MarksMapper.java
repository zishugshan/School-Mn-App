package com.schoolmanagement.mapper;

import com.schoolmanagement.dto.response.MarksResponse;
import com.schoolmanagement.entity.Marks;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MarksMapper {

    @Mapping(target = "testId", source = "test.id")
    @Mapping(target = "testName", source = "test.title")
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", expression = "java(marks.getStudent().getUser().getFirstName() + \" \" + marks.getStudent().getUser().getLastName())")
    @Mapping(target = "studentCode", source = "student.studentCode")
    @Mapping(target = "maximumMarks", source = "test.maximumMarks")
    MarksResponse toResponse(Marks marks);
}
