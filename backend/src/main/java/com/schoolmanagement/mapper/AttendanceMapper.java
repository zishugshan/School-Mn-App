package com.schoolmanagement.mapper;

import com.schoolmanagement.dto.response.AttendanceResponse;
import com.schoolmanagement.entity.Attendance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", expression = "java(attendance.getStudent().getUser().getFirstName() + \" \" + attendance.getStudent().getUser().getLastName())")
    @Mapping(target = "studentCode", source = "student.studentCode")
    @Mapping(target = "className", source = "classEntity.name")
    @Mapping(target = "sectionName", source = "section.name")
    @Mapping(target = "status", expression = "java(attendance.getStatus() != null ? attendance.getStatus().name() : null)")
    @Mapping(target = "isQrAttendance", source = "isQrAttendance")
    AttendanceResponse toResponse(Attendance attendance);
}
