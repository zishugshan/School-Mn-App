package com.schoolmanagement.mapper;

import com.schoolmanagement.dto.request.StudentRequest;
import com.schoolmanagement.dto.response.StudentResponse;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.User;
import org.mapstruct.BeanMapping;
import org.mapstruct.InjectionStrategy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", injectionStrategy = InjectionStrategy.CONSTRUCTOR)
public interface StudentMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "profilePhoto", source = "user.profilePhoto")
    @Mapping(target = "isActive", source = "user.isActive")
    @Mapping(target = "gender", expression = "java(student.getGender() != null ? student.getGender().name() : null)")
    @Mapping(target = "houseName", source = "house.name")
    @Mapping(target = "houseColor", source = "house.colorCode")
    @Mapping(target = "houseId", source = "house.id")
    @Mapping(target = "className", ignore = true)
    @Mapping(target = "sectionName", ignore = true)
    @Mapping(target = "classId", ignore = true)
    @Mapping(target = "sectionId", ignore = true)
    StudentResponse toResponse(Student student);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "studentCode", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "admissionDate", ignore = true)
    @Mapping(target = "house", ignore = true)
    @Mapping(target = "totalPoints", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Student toEntity(StudentRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "studentCode", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "admissionDate", ignore = true)
    @Mapping(target = "house", ignore = true)
    @Mapping(target = "totalPoints", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(StudentRequest request, @MappingTarget Student student);
}
