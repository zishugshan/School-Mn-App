-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Only insert sample data in development mode
-- Password for all sample users: password123 (BCrypt hash)

-- Users (password: password123 for all)
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active) VALUES
('admin@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Super', 'Admin', '9999999999', 'SUPER_ADMIN', true),
('principal@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'School', 'Admin', '9999999998', 'SCHOOL_ADMIN', true),
('rahul.teacher@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Rahul', 'Sharma', '9999999997', 'TEACHER', true),
('priya.teacher@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Priya', 'Verma', '9999999996', 'TEACHER', true),
('amit.teacher@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Amit', 'Kumar', '9999999995', 'TEACHER', true),
('student1@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Arjun', 'Patel', '9999999994', 'STUDENT', true),
('student2@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Sneha', 'Gupta', '9999999993', 'STUDENT', true),
('student3@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Rohit', 'Singh', '9999999992', 'STUDENT', true),
('student4@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Ananya', 'Reddy', '9999999991', 'STUDENT', true),
('student5@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Vikram', 'Joshi', '9999999990', 'STUDENT', true),
('student6@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Kavya', 'Nair', '9999999989', 'STUDENT', true),
('student7@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Ravi', 'Desai', '9999999988', 'STUDENT', true),
('student8@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Neha', 'Shah', '9999999987', 'STUDENT', true),
('parent1@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Mr.', 'Patel', '9999999986', 'PARENT', true),
('parent2@school.com', '$2a$10$opKZwlLqEg8gNg8IS8E.peiaDSPcOL14m3kUn3W4Npu1Ewhnv4MJC', 'Mrs.', 'Gupta', '9999999985', 'PARENT', true);

-- Students
INSERT INTO students (user_id, student_code, date_of_birth, gender, admission_date, address, city, state, house_id) VALUES
(6, 'A7K92P', '2012-05-15', 'MALE', '2023-04-01', '123 Park Street', 'Mumbai', 'Maharashtra', 1),
(7, 'Z8D1QX', '2011-08-22', 'FEMALE', '2023-04-01', '456 Lake View', 'Delhi', 'Delhi', 2),
(8, 'K4P7RM', '2012-01-10', 'MALE', '2023-04-01', '789 Hill Road', 'Bangalore', 'Karnataka', 3),
(9, 'B3M6NY', '2011-11-30', 'FEMALE', '2023-04-01', '321 River Side', 'Chennai', 'Tamil Nadu', 4),
(10, 'X2J8TW', '2012-03-18', 'MALE', '2023-04-01', '654 Garden Lane', 'Hyderabad', 'Telangana', 1),
(11, 'Q5R1CV', '2011-07-05', 'FEMALE', '2023-04-01', '987 Ocean Drive', 'Kolkata', 'West Bengal', 2),
(12, 'L9F4SD', '2012-09-12', 'MALE', '2023-04-01', '147 Mountain View', 'Pune', 'Maharashtra', 3),
(13, 'E6H3GK', '2011-12-25', 'FEMALE', '2023-04-01', '258 Valley Road', 'Ahmedabad', 'Gujarat', 4);

-- Teachers
INSERT INTO teachers (user_id, teacher_code, qualification, date_of_birth, gender, date_joined) VALUES
(3, 'TCH001', 'M.Sc. Mathematics, B.Ed.', '1985-03-10', 'MALE', '2020-06-01'),
(4, 'TCH002', 'M.A. English, B.Ed.', '1988-07-15', 'FEMALE', '2020-06-01'),
(5, 'TCH003', 'M.Sc. Physics, B.Ed.', '1986-11-20', 'MALE', '2021-06-01');

-- Parents
INSERT INTO parents (user_id, relationship) VALUES
(14, 'FATHER'),
(15, 'MOTHER');

-- Student-Parent links
INSERT INTO student_parent (student_id, parent_id) VALUES (1, 1), (2, 2), (5, 1);

-- Classes
INSERT INTO classes (name, code, description) VALUES
('Class 1', 'CLS-01', 'First Grade'),
('Class 2', 'CLS-02', 'Second Grade'),
('Class 3', 'CLS-03', 'Third Grade'),
('Class 4', 'CLS-04', 'Fourth Grade'),
('Class 5', 'CLS-05', 'Fifth Grade'),
('Class 6', 'CLS-06', 'Sixth Grade'),
('Class 7', 'CLS-07', 'Seventh Grade'),
('Class 8', 'CLS-08', 'Eighth Grade'),
('Class 9', 'CLS-09', 'Ninth Grade'),
('Class 10', 'CLS-10', 'Tenth Grade');

-- Sections
INSERT INTO sections (class_id, name, code, room_number, capacity) VALUES
(1, 'A', 'SEC-01-A', '101', 40), (1, 'B', 'SEC-01-B', '102', 40),
(2, 'A', 'SEC-02-A', '201', 40), (2, 'B', 'SEC-02-B', '202', 40),
(3, 'A', 'SEC-03-A', '301', 40),
(4, 'A', 'SEC-04-A', '401', 40),
(5, 'A', 'SEC-05-A', '501', 40),
(6, 'A', 'SEC-06-A', '601', 40),
(7, 'A', 'SEC-07-A', '701', 40),
(8, 'A', 'SEC-08-A', '801', 40),
(9, 'A', 'SEC-09-A', '901', 40),
(10, 'A', 'SEC-10-A', '1001', 40);

-- Assign subjects to classes
INSERT INTO class_subject (class_id, subject_id)
SELECT c.id, s.id FROM classes c CROSS JOIN subjects s WHERE c.id BETWEEN 6 AND 10;

-- Assign teachers to subjects
INSERT INTO teacher_subject (teacher_id, subject_id) VALUES
(1, 1), (2, 2), (3, 3), (3, 7);

-- Assign class teachers
INSERT INTO class_teacher (class_id, section_id, teacher_id, is_class_teacher) VALUES
(6, 1, 1, true), (7, 1, 2, true), (8, 1, 3, true);

-- Enroll students
INSERT INTO student_class (student_id, class_id, section_id, academic_year, is_active) VALUES
(1, 6, 1, '2024-25', true), (2, 6, 1, '2024-25', true),
(3, 7, 1, '2024-25', true), (4, 7, 1, '2024-25', true),
(5, 8, 1, '2024-25', true), (6, 8, 1, '2024-25', true),
(7, 9, 1, '2024-25', true), (8, 9, 1, '2024-25', true);

-- Sample attendance (last 30 days)
INSERT INTO attendance (student_id, class_id, section_id, date, status, marked_by)
SELECT
    s.id,
    sc.class_id,
    sc.section_id,
    d::date,
    CASE
        WHEN EXTRACT(DOW FROM d::date) IN (0, 6) THEN 'ABSENT'::attendance_status
        WHEN RANDOM() < 0.75 THEN 'PRESENT'::attendance_status
        WHEN RANDOM() < 0.5 THEN 'PRESENT'::attendance_status
        ELSE (ARRAY['ABSENT'::attendance_status, 'LATE'::attendance_status, 'HALF_DAY'::attendance_status, 'LEAVE'::attendance_status])[FLOOR(RANDOM() * 4 + 1)::int]
    END,
    3
FROM students s
JOIN student_class sc ON s.id = sc.student_id AND sc.is_active = true
CROSS JOIN generate_series(CURRENT_DATE - 30, CURRENT_DATE - 1, '1 day'::interval) d
WHERE s.id BETWEEN 1 AND 8
ON CONFLICT (student_id, date) DO NOTHING;

-- Sample attendance records
INSERT INTO attendance_records (class_id, section_id, date, marked_by, total_students, present_count, absent_count, late_count, half_day_count, leave_count)
SELECT
    sc.class_id,
    sc.section_id,
    a.date,
    3,
    COUNT(DISTINCT a.student_id),
    COUNT(DISTINCT CASE WHEN a.status = 'PRESENT' THEN a.student_id END),
    COUNT(DISTINCT CASE WHEN a.status = 'ABSENT' THEN a.student_id END),
    COUNT(DISTINCT CASE WHEN a.status = 'LATE' THEN a.student_id END),
    COUNT(DISTINCT CASE WHEN a.status = 'HALF_DAY' THEN a.student_id END),
    COUNT(DISTINCT CASE WHEN a.status = 'LEAVE' THEN a.student_id END)
FROM attendance a
JOIN student_class sc ON a.class_id = sc.class_id AND a.section_id = sc.section_id AND a.student_id = sc.student_id
WHERE a.date >= CURRENT_DATE - 7
GROUP BY sc.class_id, sc.section_id, a.date;

-- Sample homework
INSERT INTO homework (title, description, subject_id, teacher_id, due_date, max_score, is_broadcast, broadcast_level) VALUES
('Algebra Basics', 'Solve linear equations from Chapter 3', 1, 1, CURRENT_DATE + 3, 20.00, false, NULL),
('Essay on Environment', 'Write a 500-word essay on environmental conservation', 2, 2, CURRENT_DATE + 5, 25.00, false, NULL),
('Newton''s Laws', 'Explain three laws of motion with examples', 3, 3, CURRENT_DATE + 7, 30.00, false, NULL);

-- Sample homework targets
INSERT INTO homework_target (homework_id, class_id, section_id) VALUES
(1, 6, 1), (2, 7, 1), (3, 8, 1);

-- Sample homework submissions
INSERT INTO homework_submissions (homework_id, student_id, submission_text, status, submitted_at) VALUES
(1, 1, 'Here is my algebra homework solution.', 'COMPLETED'::homework_status, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 2, 'Solved all equations.', 'COMPLETED'::homework_status, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 3, 'Essay on environment protection.', 'COMPLETED'::homework_status, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 4, NULL, 'PENDING'::homework_status, NULL),
(3, 5, 'Newton''s three laws explained.', 'COMPLETED'::homework_status, CURRENT_TIMESTAMP),
(3, 6, NULL, 'PENDING'::homework_status, NULL);

-- Sample tests
INSERT INTO tests (title, description, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published) VALUES
('Math Mid-Term', 'Mid-term examination covering Algebra and Geometry', 1, 6, 1, 1, 100.00, 35.00, CURRENT_DATE - 15, 'MIDTERM'::exam_type, true),
('English Quarterly', 'Quarterly test - Grammar and Composition', 2, 7, 1, 2, 80.00, 28.00, CURRENT_DATE - 10, 'MIDTERM'::exam_type, true),
('Physics Test', 'Test on Motion and Forces', 3, 8, 1, 3, 50.00, 18.00, CURRENT_DATE - 5, 'QUIZ'::exam_type, true),
('Math Weekly Quiz', 'Weekly quiz on Linear Equations', 1, 6, 1, 1, 20.00, 8.00, CURRENT_DATE + 7, 'QUIZ'::exam_type, false);

-- Sample marks
INSERT INTO marks (test_id, student_id, marks_obtained, remarks, entered_by) VALUES
(1, 1, 85.00, 'Excellent work!', 1),
(1, 2, 78.00, 'Good, needs improvement in geometry.', 1),
(2, 3, 72.00, 'Well written essay.', 2),
(2, 4, 88.00, 'Outstanding composition.', 2),
(3, 5, 42.00, 'Good understanding of concepts.', 3),
(3, 6, 38.00, 'Good, revise second law.', 3);

-- Sample notifications
INSERT INTO notifications (title, message, type, is_global, reference_type, reference_id, created_by) VALUES
('Welcome to School Management System', 'Your account has been created successfully.', 'SUCCESS'::notification_type, true, NULL, NULL, 1),
('Homework Assigned', 'New homework: Algebra Basics has been assigned.', 'INFO'::notification_type, false, 'HOMEWORK', 1, 3),
('Test Results Published', 'Math Mid-Term results are now available.', 'INFO'::notification_type, false, 'TEST', 1, 1),
('Attendance Alert', 'Your ward was marked absent on 2024-03-15.', 'WARNING'::notification_type, false, 'ATTENDANCE', NULL, 3);

-- Distribute notifications to users
INSERT INTO user_notifications (notification_id, user_id)
SELECT 1, id FROM users WHERE is_active = true;
INSERT INTO user_notifications (notification_id, user_id)
SELECT 2, user_id FROM students WHERE id IN (1, 2);
INSERT INTO user_notifications (notification_id, user_id)
SELECT 3, user_id FROM students WHERE id IN (1, 2);
INSERT INTO user_notifications (notification_id, user_id)
SELECT 4, user_id FROM parents WHERE id = 1;

-- Sample leaderboard entries (monthly)
INSERT INTO leaderboards (student_id, class_id, section_id, category, period, score, rank, year, month) VALUES
(1, 6, 1, 'ATTENDANCE'::leaderboard_category, 'MONTHLY'::leaderboard_period, 96.67, 1, 2024, 3),
(2, 6, 1, 'ATTENDANCE'::leaderboard_category, 'MONTHLY'::leaderboard_period, 93.33, 2, 2024, 3),
(1, 6, 1, 'HOMEWORK'::leaderboard_category, 'MONTHLY'::leaderboard_period, 100.00, 1, 2024, 3),
(2, 6, 1, 'HOMEWORK'::leaderboard_category, 'MONTHLY'::leaderboard_period, 100.00, 1, 2024, 3),
(1, 6, 1, 'ACADEMICS'::leaderboard_category, 'MONTHLY'::leaderboard_period, 85.00, 1, 2024, 3),
(2, 6, 1, 'ACADEMICS'::leaderboard_category, 'MONTHLY'::leaderboard_period, 78.00, 2, 2024, 3);

-- Sample streaks
INSERT INTO student_streaks (student_id, current_attendance_streak, max_attendance_streak, last_attendance_date) VALUES
(1, 10, 10, CURRENT_DATE - 1),
(2, 7, 8, CURRENT_DATE - 1);

-- Sample chat messages
INSERT INTO chat_messages (sender_id, receiver_id, message, is_read, created_at) VALUES
(3, 14, 'Dear Parent, Arjun is doing well in Mathematics.', false, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(14, 3, 'Thank you for the update. Any areas for improvement?', false, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(3, 14, 'He could practice more geometry problems.', false, CURRENT_TIMESTAMP);

-- Sample teacher remarks
INSERT INTO teacher_remarks (student_id, teacher_id, subject_id, remark, category, is_positive) VALUES
(1, 1, 1, 'Excellent performance in Mathematics. Keep it up!', 'PERFORMANCE', true),
(2, 1, 1, 'Good improvement in problem-solving skills.', 'IMPROVEMENT', true),
(3, 2, 2, 'Needs to work on grammar.', 'ACADEMIC', false);

-- Sample calendar events
INSERT INTO calendar_events (title, description, event_date, event_type, is_holiday, is_exam) VALUES
('Summer Break', 'School closed for summer vacation', '2025-05-01', 'OTHER', true, false),
('Annual Sports Day', 'Inter-house sports competition', '2025-03-15', 'SPORTS', false, false),
('Mid-Term Exams Begin', 'Start of mid-term examinations', '2025-04-01', 'OTHER', false, true),
('Parent-Teacher Meeting', 'Annual parent-teacher interaction', '2025-02-20', 'OTHER', false, false),
('Republic Day', 'National holiday', '2025-01-26', 'OTHER', true, false);

-- Sample student goals
INSERT INTO student_goals (student_id, title, description, target_date, target_score, current_progress, category) VALUES
(1, 'Top the Class in Math', 'Achieve highest marks in Mathematics final exam', '2025-03-31', 100.00, 85.00, 'ACADEMIC'),
(2, 'Perfect Attendance', 'Achieve 100% attendance this month', '2025-03-31', 100.00, 93.33, 'ATTENDANCE'),
(3, 'Complete All Homework Early', 'Submit all homework at least 2 days before due date', '2025-03-31', 100.00, 50.00, 'HOMEWORK');
