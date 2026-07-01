-- Consolidated schema fixes from legacy V8, V9, V10, V12 migrations
-- These were missing from production DB; safe to run idempotently.

CREATE TABLE IF NOT EXISTS homework_doubts (
    id           BIGSERIAL PRIMARY KEY,
    homework_id  BIGINT NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
    sender_id    BIGINT NOT NULL REFERENCES users(id),
    sender_role  VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    message      TEXT NOT NULL,
    parent_id    BIGINT REFERENCES homework_doubts(id),
    is_resolved  BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_homework_doubts_homework ON homework_doubts(homework_id);
CREATE INDEX IF NOT EXISTS idx_homework_doubts_sender ON homework_doubts(sender_id);

ALTER TABLE student_goals ADD COLUMN IF NOT EXISTS unit VARCHAR(50);

ALTER TABLE homework_submissions ALTER COLUMN status TYPE VARCHAR(20);
ALTER TABLE tests ALTER COLUMN exam_type TYPE VARCHAR(20);
ALTER TABLE exam_schedules ALTER COLUMN exam_type TYPE VARCHAR(20);
ALTER TABLE notifications ALTER COLUMN type TYPE VARCHAR(20);
ALTER TABLE leaderboards ALTER COLUMN category TYPE VARCHAR(20);
ALTER TABLE leaderboards ALTER COLUMN period TYPE VARCHAR(20);
ALTER TABLE houses ALTER COLUMN name TYPE VARCHAR(20);
ALTER TABLE fee_records ALTER COLUMN status TYPE VARCHAR(20);
ALTER TABLE events ALTER COLUMN event_type TYPE VARCHAR(20);

ALTER TABLE student_goals ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE student_goals ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_student_goals_user_id ON student_goals(user_id);