INSERT INTO classes (name, code, description) VALUES
('Class 11', 'CLS-11', 'Eleventh Grade'),
('Class 12', 'CLS-12', 'Twelfth Grade');

DO $$
DECLARE
    c11_id BIGINT;
    c12_id BIGINT;
BEGIN
    SELECT id INTO c11_id FROM classes WHERE code = 'CLS-11';
    SELECT id INTO c12_id FROM classes WHERE code = 'CLS-12';

    INSERT INTO sections (class_id, name, code, room_number, capacity) VALUES
    (c11_id, 'A', 'SEC-11-A', '1101', 40),
    (c11_id, 'B', 'SEC-11-B', '1102', 40),
    (c11_id, 'C', 'SEC-11-C', '1103', 40),
    (c12_id, 'A', 'SEC-12-A', '1201', 40),
    (c12_id, 'B', 'SEC-12-B', '1202', 40),
    (c12_id, 'C', 'SEC-12-C', '1203', 40);
END $$;
