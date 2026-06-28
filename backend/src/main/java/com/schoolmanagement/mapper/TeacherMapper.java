package com.schoolmanagement.mapper;

import com.schoolmanagement.dto.request.TeacherRequest;
import com.schoolmanagement.dto.response.TeacherResponse;
import com.schoolmanagement.entity.Teacher;
import org.mapstruct.BeanMapping;
import org.mapstruct.InjectionStrategy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", injectionStrategy = InjectionStrategy.CONSTRUCTOR)
public interface TeacherMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "profilePhoto", source = "user.profilePhoto")
    @Mapping(target = "isActive", source = "user.isActive")
    @Mapping(target = "gender", expression = "java(teacher.getGender() != null ? teacher.getGender().name() : null)")
    @Mapping(target = "subjects", ignore = true)
    TeacherResponse toResponse(Teacher teacher);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "teacherCode", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "subjects", ignore = true)
    @Mapping(target = "dateJoined", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Teacher toEntity(TeacherRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "teacherCode", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "subjects", ignore = true)
    @Mapping(target = "dateJoined", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(TeacherRequest request, @MappingTarget Teacher teacher);
}
