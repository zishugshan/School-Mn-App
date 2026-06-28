CREATE TABLE schools (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    domain          VARCHAR(255),
    contact_email   VARCHAR(255),
    contact_phone   VARCHAR(20),
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    subscription    VARCHAR(50) DEFAULT 'trial',
    max_students    INTEGER DEFAULT 500,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
