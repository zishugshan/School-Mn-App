package com.schoolmanagement.service;

import com.schoolmanagement.dto.response.BulkImportResponse;
import com.schoolmanagement.entity.ClassEntity;
import com.schoolmanagement.entity.Role;
import com.schoolmanagement.entity.Section;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.StudentClass;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.entity.enums.Gender;
import com.schoolmanagement.repository.ClassRepository;
import com.schoolmanagement.repository.SectionRepository;
import com.schoolmanagement.repository.StudentClassRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BulkImportService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final StudentCodeGenerator studentCodeGenerator;
    private final StudentClassRepository studentClassRepository;
    private final ClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PASSWORD = "SCHOOL@2024";

    @Transactional
    public BulkImportResponse importStudents(MultipartFile file) {
        BulkImportResponse response = new BulkImportResponse();
        String filename = file.getOriginalFilename();
        boolean isExcel = filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"));

        try {
            List<String[]> rows;
            if (isExcel) {
                rows = parseExcel(file);
            } else {
                rows = parseCsv(file);
            }

            if (rows.isEmpty()) {
                response.setMessage("No data rows found");
                return response;
            }

            String[] header = rows.get(0);
            int firstNameIdx = indexOf(header, "First Name", "firstName", "first_name");
            int lastNameIdx = indexOf(header, "Last Name", "lastName", "last_name");
            int emailIdx = indexOf(header, "Email", "email");
            int dobIdx = indexOf(header, "Date of Birth", "dateOfBirth", "dob", "date_of_birth");
            int genderIdx = indexOf(header, "Gender", "gender");
            int classIdx = indexOf(header, "Class", "className", "class");
            int sectionIdx = indexOf(header, "Section", "section");
            int addressIdx = indexOf(header, "Address", "address");
            int cityIdx = indexOf(header, "City", "city");
            int stateIdx = indexOf(header, "State", "state");
            int pinIdx = indexOf(header, "Pin Code", "pinCode", "pin_code", "pincode");

            if (firstNameIdx == -1 || lastNameIdx == -1 || emailIdx == -1) {
                response.setErrorCount(1);
                response.getErrors().add(new BulkImportResponse.ImportError(
                        1, "", "Missing required columns: First Name, Last Name, Email"
                ));
                return response;
            }

            int year = LocalDate.now().getYear();
            String academicYear = year + "-" + ((year + 1) % 100);

            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                if (isRowEmpty(row)) continue;

                response.setTotalRows(response.getTotalRows() + 1);
                String email = getCell(row, emailIdx);

                try {
                    if (email == null || email.isBlank()) {
                        throw new IllegalArgumentException("Email is required");
                    }
                    if (userRepository.existsByEmail(email)) {
                        throw new IllegalArgumentException("Email already exists: " + email);
                    }

                    String firstName = getCell(row, firstNameIdx);
                    String lastName = getCell(row, lastNameIdx);

                    User user = User.builder()
                            .email(email.trim().toLowerCase())
                            .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                            .firstName(firstName != null ? firstName.trim() : "")
                            .lastName(lastName != null ? lastName.trim() : "")
                            .role(Role.STUDENT)
                            .isActive(true)
                            .isLocked(false)
                            .build();
                    user = userRepository.save(user);

                    String studentCode = studentCodeGenerator.generateStudentCode();
                    Student student = Student.builder()
                            .user(user)
                            .studentCode(studentCode)
                            .dateOfBirth(parseDate(getCell(row, dobIdx)))
                            .gender(parseGender(getCell(row, genderIdx)))
                            .admissionDate(LocalDate.now())
                            .address(getCell(row, addressIdx))
                            .city(getCell(row, cityIdx))
                            .state(getCell(row, stateIdx))
                            .pinCode(getCell(row, pinIdx))
                            .build();
                    student = studentRepository.save(student);

                    String className = getCell(row, classIdx);
                    String sectionName = getCell(row, sectionIdx);
                    if (className != null && !className.isBlank()) {
                        ClassEntity classEntity = resolveClass(className.trim());
                        Section section = resolveSection(classEntity, sectionName != null ? sectionName.trim() : "A");

                        StudentClass sc = StudentClass.builder()
                                .student(student)
                                .classEntity(classEntity)
                                .section(section)
                                .academicYear(academicYear)
                                .isActive(true)
                                .build();
                        studentClassRepository.save(sc);
                    }

                    response.setSuccessCount(response.getSuccessCount() + 1);
                } catch (Exception e) {
                    response.setErrorCount(response.getErrorCount() + 1);
                    response.getErrors().add(new BulkImportResponse.ImportError(
                            i + 1, email != null ? email : "", e.getMessage()
                    ));
                }
            }
        } catch (Exception e) {
            response.setErrorCount(1);
            response.getErrors().add(new BulkImportResponse.ImportError(
                    0, "", "Failed to parse file: " + e.getMessage()
            ));
        }

        return response;
    }

    @Transactional
    public BulkImportResponse importTeachers(MultipartFile file) {
        BulkImportResponse response = new BulkImportResponse();
        String filename = file.getOriginalFilename();
        boolean isExcel = filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"));

        try {
            List<String[]> rows;
            if (isExcel) {
                rows = parseExcel(file);
            } else {
                rows = parseCsv(file);
            }

            if (rows.isEmpty()) {
                response.setMessage("No data rows found");
                return response;
            }

            String[] header = rows.get(0);
            int firstNameIdx = indexOf(header, "First Name", "firstName", "first_name");
            int lastNameIdx = indexOf(header, "Last Name", "lastName", "last_name");
            int emailIdx = indexOf(header, "Email", "email");
            int dobIdx = indexOf(header, "Date of Birth", "dateOfBirth", "dob", "date_of_birth");
            int genderIdx = indexOf(header, "Gender", "gender");
            int qualIdx = indexOf(header, "Qualification", "qualification");
            int addressIdx = indexOf(header, "Address", "address");
            int phoneIdx = indexOf(header, "Phone", "phone");

            if (firstNameIdx == -1 || lastNameIdx == -1 || emailIdx == -1) {
                response.setErrorCount(1);
                response.getErrors().add(new BulkImportResponse.ImportError(
                        1, "", "Missing required columns: First Name, Last Name, Email"
                ));
                return response;
            }

            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                if (isRowEmpty(row)) continue;

                response.setTotalRows(response.getTotalRows() + 1);
                String email = getCell(row, emailIdx);

                try {
                    if (email == null || email.isBlank()) {
                        throw new IllegalArgumentException("Email is required");
                    }
                    if (userRepository.existsByEmail(email)) {
                        throw new IllegalArgumentException("Email already exists: " + email);
                    }

                    String firstName = getCell(row, firstNameIdx);
                    String lastName = getCell(row, lastNameIdx);
                    String phone = getCell(row, phoneIdx);
                    String address = getCell(row, addressIdx);

                    User user = User.builder()
                            .email(email.trim().toLowerCase())
                            .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                            .firstName(firstName != null ? firstName.trim() : "")
                            .lastName(lastName != null ? lastName.trim() : "")
                            .phone(phone != null ? phone.trim() : null)
                            .role(Role.TEACHER)
                            .isActive(true)
                            .isLocked(false)
                            .build();
                    user = userRepository.save(user);

                    Teacher teacher = Teacher.builder()
                            .user(user)
                            .teacherCode("TCH" + System.currentTimeMillis() + (i % 1000))
                            .qualification(getCell(row, qualIdx))
                            .dateOfBirth(parseDate(getCell(row, dobIdx)))
                            .gender(parseGender(getCell(row, genderIdx)))
                            .address(address)
                            .phone(phone != null ? phone.trim() : null)
                            .dateJoined(LocalDate.now())
                            .build();
                    teacherRepository.save(teacher);

                    response.setSuccessCount(response.getSuccessCount() + 1);
                } catch (Exception e) {
                    response.setErrorCount(response.getErrorCount() + 1);
                    response.getErrors().add(new BulkImportResponse.ImportError(
                            i + 1, email != null ? email : "", e.getMessage()
                    ));
                }
            }
        } catch (Exception e) {
            response.setErrorCount(1);
            response.getErrors().add(new BulkImportResponse.ImportError(
                    0, "", "Failed to parse file: " + e.getMessage()
            ));
        }

        return response;
    }

    private ClassEntity resolveClass(String className) {
        return classRepository.findByName(className)
                .orElseGet(() -> classRepository.findByCode("CLS-" + className)
                        .orElseGet(() -> {
                            ClassEntity newClass = ClassEntity.builder()
                                    .name(className)
                                    .code("CLS-" + className)
                                    .description("Class " + className)
                                    .isActive(true)
                                    .build();
                            return classRepository.save(newClass);
                        }));
    }

    private Section resolveSection(ClassEntity classEntity, String sectionName) {
        Long cid = classEntity.getId();
        String name = sectionName.toUpperCase();
        return sectionRepository.findByClassEntityIdAndName(cid, name)
                .orElseGet(() -> {
                    Section newSection = Section.builder()
                            .classEntity(classEntity)
                            .name(name)
                            .code("SEC-" + cid + "-" + name)
                            .capacity(40)
                            .isActive(true)
                            .build();
                    return sectionRepository.save(newSection);
                });
    }

    private List<String[]> parseCsv(MultipartFile file) throws Exception {
        List<String[]> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                rows.add(parseCsvLine(line));
            }
        }
        return rows;
    }

    private String[] parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder field = new StringBuilder();
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    field.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                fields.add(field.toString().trim());
                field = new StringBuilder();
            } else {
                field.append(c);
            }
        }
        fields.add(field.toString().trim());
        return fields.toArray(new String[0]);
    }

    private List<String[]> parseExcel(MultipartFile file) throws Exception {
        List<String[]> rows = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                List<String> fields = new ArrayList<>();
                for (int i = 0; i < row.getLastCellNum(); i++) {
                    var cell = row.getCell(i);
                    fields.add(cell != null ? getCellValueAsString(cell) : "");
                }
                rows.add(fields.toArray(new String[0]));
            }
        }
        return rows;
    }

    private String getCellValueAsString(org.apache.poi.ss.usermodel.Cell cell) {
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                double val = cell.getNumericCellValue();
                if (val == Math.floor(val) && !Double.isInfinite(val)) {
                    yield String.valueOf((long) val);
                }
                yield String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private String getCell(String[] row, int idx) {
        if (idx < 0 || idx >= row.length) return null;
        String val = row[idx];
        return (val == null || val.isBlank()) ? null : val;
    }

    private int indexOf(String[] header, String... aliases) {
        for (int i = 0; i < header.length; i++) {
            for (String alias : aliases) {
                if (header[i].trim().equalsIgnoreCase(alias)) {
                    return i;
                }
            }
        }
        return -1;
    }

    private boolean isRowEmpty(String[] row) {
        for (String cell : row) {
            if (cell != null && !cell.isBlank()) return false;
        }
        return true;
    }

    private LocalDate parseDate(String value) {
        if (value == null) return LocalDate.now();
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            return LocalDate.now();
        }
    }

    private Gender parseGender(String value) {
        if (value == null) return Gender.OTHER;
        String upper = value.trim().toUpperCase();
        try {
            return Gender.valueOf(upper);
        } catch (IllegalArgumentException e) {
            if (upper.startsWith("M")) return Gender.MALE;
            if (upper.startsWith("F")) return Gender.FEMALE;
            return Gender.OTHER;
        }
    }
}
