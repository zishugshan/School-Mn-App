-- Ensure sequences are at expected values after V2
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 16;
ALTER SEQUENCE IF EXISTS students_id_seq RESTART WITH 9;
ALTER SEQUENCE IF EXISTS student_class_id_seq RESTART WITH 13;

-- Fix existing student_class section_id mismatches (V2 used section_id=1 for all)
-- Vikram (student_id=5) & Kavya (student_id=6) are in Class 8 → should use section_id=10
UPDATE student_class SET section_id = 10 WHERE student_id IN (5, 6) AND class_id = 8;
-- Ravi (student_id=7) & Neha (student_id=8) are in Class 9 → should use section_id=11
UPDATE student_class SET section_id = 11 WHERE student_id IN (7, 8) AND class_id = 9;

-- Additional students for Classes 8, 9, 10
-- Each class gets 2 new students (besides the existing ones from V2)
-- Class 8 already has: Vikram Joshi (student_id=5), Kavya Nair (student_id=6)
-- Class 9 already has: Ravi Desai (student_id=7), Neha Shah (student_id=8)
-- Class 10 has: none

-- 6 new user accounts (IDs 16-21)
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active) VALUES
('student9@school.com',  '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Aarav',  'Mehta',   '9999999979', 'STUDENT', true),
('student10@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Isha',   'Kapoor',  '9999999978', 'STUDENT', true),
('student11@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Dhruv',  'Yadav',   '9999999977', 'STUDENT', true),
('student12@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Myra',   'Sharma',  '9999999976', 'STUDENT', true),
('student13@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Kabir',  'Singh',   '9999999975', 'STUDENT', true),
('student14@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Aanya',  'Verma',   '9999999974', 'STUDENT', true);

-- 6 new student records (IDs 9-14)
INSERT INTO students (user_id, student_code, date_of_birth, gender, admission_date, address, city, state) VALUES
(16, 'R2T5VB', '2011-04-10', 'MALE',   '2024-04-01', '12 Sunrise Ave',   'Mumbai',    'Maharashtra'),
(17, 'J3K8LX', '2010-09-15', 'FEMALE', '2024-04-01', '34 Moonlight Rd',  'Delhi',     'Delhi'),
(18, 'M7N2QC', '2009-06-20', 'MALE',   '2024-04-01', '56 Star Lane',     'Bangalore', 'Karnataka'),
(19, 'P4S9WD', '2009-11-05', 'FEMALE', '2024-04-01', '78 Cloud St',      'Chennai',   'Tamil Nadu'),
(20, 'H1R3YF', '2008-02-14', 'MALE',   '2024-04-01', '90 Rainbow Dr',    'Hyderabad', 'Telangana'),
(21, 'T5E7UG', '2008-07-28', 'FEMALE', '2024-04-01', '11 Galaxy Way',    'Kolkata',   'West Bengal');

-- Student-class assignments
-- Class 8 (section_id=10) — now has 4 students total (Vikram, Kavya + Aarav, Isha)
INSERT INTO student_class (student_id, class_id, section_id, academic_year, is_active) VALUES
(9,  8, 10, '2024-25', true),   -- Aarav → Class 8
(10, 8, 10, '2024-25', true),   -- Isha  → Class 8
(11, 9, 11, '2024-25', true),   -- Dhruv → Class 9
(12, 9, 11, '2024-25', true),   -- Myra  → Class 9
(13, 10, 12, '2024-25', true),  -- Kabir → Class 10
(14, 10, 12, '2024-25', true);  -- Aanya → Class 10
