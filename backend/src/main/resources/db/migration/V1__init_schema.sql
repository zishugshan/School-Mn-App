-- ============================================================
-- SCHOOL MANAGEMENT SYSTEM - COMPLETE SCHEMA
-- ============================================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN','SCHOOL_ADMIN','TEACHER','STUDENT','PARENT');
CREATE TYPE gender AS ENUM ('MALE','FEMALE','OTHER');
CREATE TYPE attendance_status AS ENUM ('PRESENT','ABSENT','LATE','HALF_DAY','LEAVE');
CREATE TYPE homework_status AS ENUM ('PENDING','COMPLETED','OVERDUE','SUBMITTED');
CREATE TYPE notification_type AS ENUM ('INFO','WARNING','SUCCESS','ERROR');
CREATE TYPE leaderboard_period AS ENUM ('MONTHLY','YEARLY');
CREATE TYPE leaderboard_category AS ENUM ('ATTENDANCE','HOMEWORK','ACADEMICS');
CREATE TYPE house_name AS ENUM ('RED','BLUE','GREEN','YELLOW');
CREATE TYPE event_type AS ENUM ('SPORTS','ACADEMIC','CULTURAL','OTHER');
CREATE TYPE fee_status AS ENUM ('PAID','UNPAID','PARTIAL','WAIVED');
CREATE TYPE exam_type AS ENUM ('MIDTERM','FINAL','QUIZ','ASSIGNMENT','OTHER');

-- ============================================================
-- CORE TABLES
-- ============================================================

CREATE TABLE houses (
    id              BIGSERIAL PRIMARY KEY,
    name            house_name NOT NULL UNIQUE,
    color_code      VARCHAR(7) NOT NULL,
    motto           VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    profile_photo   VARCHAR(500),
    role            user_role NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    is_locked       BOOLEAN DEFAULT FALSE,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id),
    action          VARCHAR(255) NOT NULL,
    entity_type     VARCHAR(100),
    entity_id       BIGINT,
    details         TEXT,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id),
    student_code    VARCHAR(6) NOT NULL UNIQUE,
    date_of_birth   DATE NOT NULL,
    gender          gender NOT NULL,
    admission_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    pin_code        VARCHAR(10),
    house_id        BIGINT REFERENCES houses(id),
    total_points    INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parents (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id),
    occupation      VARCHAR(100),
    address         TEXT,
    relationship    VARCHAR(50),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_parent (
    student_id      BIGINT NOT NULL REFERENCES students(id),
    parent_id       BIGINT NOT NULL REFERENCES parents(id),
    PRIMARY KEY (student_id, parent_id)
);

CREATE TABLE teachers (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id),
    teacher_code    VARCHAR(20) NOT NULL UNIQUE,
    qualification   VARCHAR(255),
    date_of_birth   DATE,
    gender          gender,
    address         TEXT,
    phone           VARCHAR(20),
    date_joined     DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subjects (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20) NOT NULL UNIQUE,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    code            VARCHAR(20) NOT NULL UNIQUE,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sections (
    id              BIGSERIAL PRIMARY KEY,
    class_id        BIGINT NOT NULL REFERENCES classes(id),
    name            VARCHAR(20) NOT NULL,
    code            VARCHAR(20) NOT NULL UNIQUE,
    room_number     VARCHAR(20),
    capacity        INTEGER DEFAULT 40,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_id, name)
);

CREATE TABLE class_subject (
    class_id        BIGINT NOT NULL REFERENCES classes(id),
    subject_id      BIGINT NOT NULL REFERENCES subjects(id),
    PRIMARY KEY (class_id, subject_id)
);

CREATE TABLE teacher_subject (
    teacher_id      BIGINT NOT NULL REFERENCES teachers(id),
    subject_id      BIGINT NOT NULL REFERENCES subjects(id),
    PRIMARY KEY (teacher_id, subject_id)
);

CREATE TABLE class_teacher (
    class_id        BIGINT NOT NULL REFERENCES classes(id),
    section_id      BIGINT NOT NULL REFERENCES sections(id),
    teacher_id      BIGINT NOT NULL REFERENCES teachers(id),
    is_class_teacher BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (class_id, section_id, teacher_id)
);

CREATE TABLE student_class (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    class_id        BIGINT NOT NULL REFERENCES classes(id),
    section_id      BIGINT NOT NULL REFERENCES sections(id),
    academic_year   VARCHAR(9) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, academic_year)
);

-- ============================================================
-- ATTENDANCE MODULE
-- ============================================================

CREATE TABLE attendance (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    class_id        BIGINT NOT NULL REFERENCES classes(id),
    section_id      BIGINT NOT NULL REFERENCES sections(id),
    date            DATE NOT NULL,
    status          attendance_status NOT NULL,
    marked_by       BIGINT NOT NULL REFERENCES users(id),
    remarks         TEXT,
    is_qr_attendance BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, date)
);

CREATE TABLE attendance_records (
    id              BIGSERIAL PRIMARY KEY,
    class_id        BIGINT NOT NULL REFERENCES classes(id),
    section_id      BIGINT NOT NULL REFERENCES sections(id),
    date            DATE NOT NULL,
    marked_by       BIGINT NOT NULL REFERENCES users(id),
    total_students  INTEGER NOT NULL,
    present_count   INTEGER DEFAULT 0,
    absent_count    INTEGER DEFAULT 0,
    late_count      INTEGER DEFAULT 0,
    half_day_count  INTEGER DEFAULT 0,
    leave_count     INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_id, section_id, date)
);

-- ============================================================
-- HOMEWORK MODULE
-- ============================================================

CREATE TABLE homework (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    subject_id      BIGINT NOT NULL REFERENCES subjects(id),
    teacher_id      BIGINT NOT NULL REFERENCES teachers(id),
    due_date        TIMESTAMP NOT NULL,
    max_score       DECIMAL(5,2),
    attachment_url  VARCHAR(500),
    is_broadcast    BOOLEAN DEFAULT FALSE,
    broadcast_level VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE homework_target (
    id              BIGSERIAL PRIMARY KEY,
    homework_id     BIGINT NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
    class_id        BIGINT REFERENCES classes(id),
    section_id      BIGINT REFERENCES sections(id),
    student_id      BIGINT REFERENCES students(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE homework_submissions (
    id              BIGSERIAL PRIMARY KEY,
    homework_id     BIGINT NOT NULL REFERENCES homework(id),
    student_id      BIGINT NOT NULL REFERENCES students(id),
    submission_text TEXT,
    attachment_url  VARCHAR(500),
    score           DECIMAL(5,2),
    feedback        TEXT,
    status          homework_status DEFAULT 'PENDING',
    submitted_at    TIMESTAMP,
    graded_at       TIMESTAMP,
    graded_by       BIGINT REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (homework_id, student_id)
);

-- ============================================================
-- TESTS & MARKS MODULE
-- ============================================================

CREATE TABLE tests (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    subject_id      BIGINT NOT NULL REFERENCES subjects(id),
    class_id        BIGINT NOT NULL REFERENCES classes(id),
    section_id      BIGINT REFERENCES sections(id),
    teacher_id      BIGINT NOT NULL REFERENCES teachers(id),
    maximum_marks   DECIMAL(6,2) NOT NULL,
    passing_marks   DECIMAL(6,2),
    test_date       DATE NOT NULL,
    exam_type       exam_type DEFAULT 'OTHER',
    is_published    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE marks (
    id              BIGSERIAL PRIMARY KEY,
    test_id         BIGINT NOT NULL REFERENCES tests(id),
    student_id      BIGINT NOT NULL REFERENCES students(id),
    marks_obtained  DECIMAL(6,2) NOT NULL,
    remarks         TEXT,
    entered_by      BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (test_id, student_id)
);

-- ============================================================
-- NOTIFICATIONS MODULE
-- ============================================================

CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    type            notification_type DEFAULT 'INFO',
    is_global       BOOLEAN DEFAULT FALSE,
    reference_type  VARCHAR(50),
    reference_id    BIGINT,
    created_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_notifications (
    id              BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (notification_id, user_id)
);

-- ============================================================
-- LEADERBOARDS
-- ============================================================

CREATE TABLE leaderboards (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    class_id        BIGINT REFERENCES classes(id),
    section_id      BIGINT REFERENCES sections(id),
    category        leaderboard_category NOT NULL,
    period          leaderboard_period NOT NULL,
    score           DECIMAL(10,2) NOT NULL,
    rank            INTEGER NOT NULL,
    year            INTEGER NOT NULL,
    month           INTEGER,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- GAMIFICATION
-- ============================================================

CREATE TABLE badges (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    icon_url        VARCHAR(500),
    criteria        TEXT,
    points          INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_badges (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    badge_id        BIGINT NOT NULL REFERENCES badges(id),
    awarded_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, badge_id)
);

CREATE TABLE achievements (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    points          INTEGER DEFAULT 0,
    achieved_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_streaks (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL UNIQUE REFERENCES students(id),
    current_attendance_streak  INTEGER DEFAULT 0,
    max_attendance_streak     INTEGER DEFAULT 0,
    current_homework_streak   INTEGER DEFAULT 0,
    max_homework_streak      INTEGER DEFAULT 0,
    last_attendance_date      DATE,
    last_homework_date        DATE,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TIMETABLE
-- ============================================================

CREATE TABLE timetable_entries (
    id              BIGSERIAL PRIMARY KEY,
    class_id        BIGINT NOT NULL REFERENCES classes(id),
    section_id      BIGINT NOT NULL REFERENCES sections(id),
    subject_id      BIGINT NOT NULL REFERENCES subjects(id),
    teacher_id      BIGINT NOT NULL REFERENCES teachers(id),
    day_of_week     INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    room_number     VARCHAR(20),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_id, section_id, day_of_week, start_time)
);

-- ============================================================
-- EXAMS SCHEDULE
-- ============================================================

CREATE TABLE exam_schedules (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    class_id        BIGINT NOT NULL REFERENCES classes(id),
    section_id      BIGINT REFERENCES sections(id),
    subject_id      BIGINT NOT NULL REFERENCES subjects(id),
    exam_type       exam_type NOT NULL,
    date            DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    room_number     VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- FEE MANAGEMENT
-- ============================================================

CREATE TABLE fee_types (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    amount          DECIMAL(10,2) NOT NULL,
    frequency       VARCHAR(20) NOT NULL,
    is_mandatory    BOOLEAN DEFAULT TRUE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fee_records (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    fee_type_id     BIGINT NOT NULL REFERENCES fee_types(id),
    class_id        BIGINT NOT NULL REFERENCES classes(id),
    amount          DECIMAL(10,2) NOT NULL,
    paid_amount     DECIMAL(10,2) DEFAULT 0,
    due_date        DATE NOT NULL,
    paid_date       DATE,
    status          fee_status DEFAULT 'UNPAID',
    payment_method  VARCHAR(50),
    transaction_id  VARCHAR(100),
    receipt_url     VARCHAR(500),
    remarks         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- EVENTS MANAGEMENT
-- ============================================================

CREATE TABLE events (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    event_type      event_type NOT NULL,
    start_date      TIMESTAMP NOT NULL,
    end_date        TIMESTAMP NOT NULL,
    location        VARCHAR(255),
    organizer_id    BIGINT REFERENCES users(id),
    house_id        BIGINT REFERENCES houses(id),
    max_participants INTEGER,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_participants (
    id              BIGSERIAL PRIMARY KEY,
    event_id        BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    result          VARCHAR(100),
    points          INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, student_id)
);

-- ============================================================
-- LIBRARY MANAGEMENT
-- ============================================================

CREATE TABLE library_books (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    author          VARCHAR(255),
    isbn            VARCHAR(20) UNIQUE,
    publisher       VARCHAR(255),
    category        VARCHAR(100),
    quantity        INTEGER DEFAULT 1,
    available       INTEGER DEFAULT 1,
    shelf_location  VARCHAR(50),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_issues (
    id              BIGSERIAL PRIMARY KEY,
    book_id         BIGINT NOT NULL REFERENCES library_books(id),
    student_id      BIGINT REFERENCES students(id),
    teacher_id      BIGINT REFERENCES teachers(id),
    issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE NOT NULL,
    return_date     DATE,
    status          VARCHAR(20) DEFAULT 'ISSUED',
    fine_amount     DECIMAL(8,2) DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TRANSPORT MANAGEMENT
-- ============================================================

CREATE TABLE transport_routes (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    vehicle_number  VARCHAR(50),
    driver_name     VARCHAR(100),
    driver_phone    VARCHAR(20),
    capacity        INTEGER DEFAULT 40,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transport_stops (
    id              BIGSERIAL PRIMARY KEY,
    route_id        BIGINT NOT NULL REFERENCES transport_routes(id),
    name            VARCHAR(100) NOT NULL,
    address         TEXT,
    stop_order      INTEGER NOT NULL,
    pickup_time     TIME,
    drop_time       TIME,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_transport (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    route_id        BIGINT NOT NULL REFERENCES transport_routes(id),
    stop_id         BIGINT NOT NULL REFERENCES transport_stops(id),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id)
);

-- ============================================================
-- CHAT / PARENT-TEACHER COMMUNICATION
-- ============================================================

CREATE TABLE chat_messages (
    id              BIGSERIAL PRIMARY KEY,
    sender_id       BIGINT NOT NULL REFERENCES users(id),
    receiver_id     BIGINT NOT NULL REFERENCES users(id),
    message         TEXT NOT NULL,
    attachment_url  VARCHAR(500),
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teacher_remarks (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    teacher_id      BIGINT NOT NULL REFERENCES teachers(id),
    subject_id      BIGINT REFERENCES subjects(id),
    remark          TEXT NOT NULL,
    category        VARCHAR(50),
    is_positive     BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STUDENT GOALS
-- ============================================================

CREATE TABLE student_goals (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    target_date     DATE,
    target_score    DECIMAL(6,2),
    current_progress DECIMAL(5,2) DEFAULT 0,
    is_completed    BOOLEAN DEFAULT FALSE,
    category        VARCHAR(50),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DIGITAL CERTIFICATES
-- ============================================================

CREATE TABLE certificates (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    certificate_type VARCHAR(50) NOT NULL,
    issued_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    certificate_url VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SCHOOL CALENDAR
-- ============================================================

CREATE TABLE calendar_events (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    event_date      DATE NOT NULL,
    end_date        DATE,
    event_type      VARCHAR(50),
    is_holiday      BOOLEAN DEFAULT FALSE,
    is_exam         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================

CREATE TABLE refresh_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    token           VARCHAR(500) NOT NULL UNIQUE,
    expires_at      TIMESTAMP NOT NULL,
    is_revoked      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_code ON students(student_code);
CREATE INDEX idx_students_house ON students(house_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_class ON attendance(class_id, section_id, date);
CREATE INDEX idx_homework_teacher ON homework(teacher_id);
CREATE INDEX idx_homework_due ON homework(due_date);
CREATE INDEX idx_homework_submissions_student ON homework_submissions(student_id);
CREATE INDEX idx_homework_submissions_homework ON homework_submissions(homework_id);
CREATE INDEX idx_tests_class ON tests(class_id, section_id);
CREATE INDEX idx_tests_subject ON tests(subject_id);
CREATE INDEX idx_marks_test ON marks(test_id);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_notifications_user ON user_notifications(user_id, is_read);
CREATE INDEX idx_leaderboards_category ON leaderboards(category, period, year, month);
CREATE INDEX idx_chat_participants ON chat_messages(sender_id, receiver_id);
CREATE INDEX idx_timetable_entry ON timetable_entries(class_id, section_id, day_of_week);
CREATE INDEX idx_fee_records_student ON fee_records(student_id, status);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Houses
INSERT INTO houses (name, color_code, motto) VALUES
('RED', '#E53935', 'Courage and Valor'),
('BLUE', '#1E88E5', 'Wisdom and Knowledge'),
('GREEN', '#43A047', 'Growth and Harmony'),
('YELLOW', '#FDD835', 'Energy and Optimism');

-- Default subjects
INSERT INTO subjects (name, code, description) VALUES
('Mathematics', 'MATH', 'Mathematics'),
('English', 'ENG', 'English Language and Literature'),
('Science', 'SCI', 'General Science'),
('Social Studies', 'SST', 'Social Studies'),
('Hindi', 'HIN', 'Hindi Language'),
('Computer Science', 'CS', 'Computer Science and Programming'),
('Physics', 'PHY', 'Physics'),
('Chemistry', 'CHE', 'Chemistry'),
('Biology', 'BIO', 'Biology'),
('Physical Education', 'PE', 'Physical Education and Sports');

-- Default badges
INSERT INTO badges (name, description, points, criteria) VALUES
('Perfect Attendance', '100% attendance for a month', 100, 'attendance_100_month'),
('Homework Star', 'Completed all homework on time for a month', 100, 'homework_all_month'),
('Academic Excellence', 'Topped the class in exams', 200, 'academic_topper'),
('Streak Master', '10-day attendance streak', 50, 'attendance_streak_10'),
('Homework Champion', 'Most homework completed in class', 150, 'homework_champion'),
('Quick Learner', 'Improved marks by 20%', 150, 'marks_improvement_20'),
('House Hero', 'Earned most points for house', 300, 'house_top_points'),
('Sports Star', 'Won inter-house sports event', 200, 'sports_winner'),
('Perfect Week', '100% attendance for a week', 30, 'attendance_week_100'),
('Goal Achiever', 'Completed a personal goal', 100, 'goal_completed');
