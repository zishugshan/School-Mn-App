CREATE TABLE homework_doubts (
    id           BIGSERIAL PRIMARY KEY,
    homework_id  BIGINT NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
    sender_id    BIGINT NOT NULL REFERENCES users(id),
    sender_role  VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    message      TEXT NOT NULL,
    parent_id    BIGINT REFERENCES homework_doubts(id),
    is_resolved  BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_homework_doubts_homework ON homework_doubts(homework_id);
CREATE INDEX idx_homework_doubts_sender ON homework_doubts(sender_id);
