CREATE TABLE library_resources (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    resource_type   VARCHAR(20) NOT NULL CHECK (resource_type IN ('PDF', 'BOOK', 'LINK')),
    url             TEXT NOT NULL,
    category        VARCHAR(100) NOT NULL,
    class_id        BIGINT REFERENCES classes(id),
    uploaded_by_id  BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lr_category ON library_resources(category);
CREATE INDEX idx_lr_class_id ON library_resources(class_id);
CREATE INDEX idx_lr_resource_type ON library_resources(resource_type);
