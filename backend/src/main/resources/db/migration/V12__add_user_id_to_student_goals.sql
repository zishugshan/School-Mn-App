ALTER TABLE student_goals ALTER COLUMN student_id DROP NOT NULL;

ALTER TABLE student_goals ADD COLUMN user_id BIGINT REFERENCES users(id);
CREATE INDEX idx_student_goals_user_id ON student_goals(user_id);
