INSERT INTO classes (name, code, description) VALUES
('Class 1', 'CLS-1', 'First Grade'),
('Class 2', 'CLS-2', 'Second Grade'),
('Class 3', 'CLS-3', 'Third Grade'),
('Class 4', 'CLS-4', 'Fourth Grade'),
('Class 5', 'CLS-5', 'Fifth Grade'),
('Class 6', 'CLS-6', 'Sixth Grade'),
('Class 7', 'CLS-7', 'Seventh Grade'),
('Class 8', 'CLS-8', 'Eighth Grade'),
('Class 9', 'CLS-9', 'Ninth Grade'),
('Class 10', 'CLS-10', 'Tenth Grade'),
('Class 11', 'CLS-11', 'Eleventh Grade'),
('Class 12', 'CLS-12', 'Twelfth Grade');

DO $$
DECLARE
    class_record RECORD;
    section_letter CHAR(1);
BEGIN
    FOR class_record IN SELECT id, code FROM classes WHERE code LIKE 'CLS-%' LOOP
        FOR section_letter IN SELECT unnest(ARRAY['A', 'B', 'C']) LOOP
            INSERT INTO sections (class_id, name, code, capacity)
            VALUES (class_record.id, section_letter, 'SEC-' || class_record.id || '-' || section_letter, 40)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
