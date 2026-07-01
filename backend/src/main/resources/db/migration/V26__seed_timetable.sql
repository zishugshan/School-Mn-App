-- Create timetable (6 periods/day, Mon-Fri per section)
DO $$
BEGIN
    IF (SELECT COUNT(*) > 10 FROM timetable_entries) THEN
        RAISE NOTICE 'Timetable exists, skipping V26';
        RETURN;
    END IF;

    INSERT INTO timetable_entries (class_id, section_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number)
    WITH subjects_per_section AS (
        SELECT c.id AS class_id, sec.id AS section_id, s.id AS subject_id,
               ROW_NUMBER() OVER (PARTITION BY c.id, sec.id ORDER BY s.id) - 1 AS rn,
               COUNT(*) OVER (PARTITION BY c.id, sec.id) AS cnt
        FROM classes c
        JOIN sections sec ON sec.class_id = c.id
        JOIN subjects s ON s.name = ANY(
            CASE WHEN CAST(SUBSTRING(c.name FROM 7) AS INT) <= 5 THEN
                ARRAY['Mathematics','English','Science','Hindi','Physical Education']
            WHEN CAST(SUBSTRING(c.name FROM 7) AS INT) <= 10 THEN
                ARRAY['Mathematics','English','Science','Social Studies','Hindi','Computer Science']
            ELSE
                ARRAY['Physics','Chemistry','Biology','Mathematics','English','Physical Education']
            END
        )
    )
    SELECT
        sps.class_id, sps.section_id, sps.subject_id,
        COALESCE((SELECT ts.teacher_id FROM teacher_subject ts WHERE ts.subject_id = sps.subject_id ORDER BY RANDOM() LIMIT 1), (SELECT id FROM teachers ORDER BY id LIMIT 1)),
        d.dow,
        ('08:00'::TIME + (p.period * 50 || ' minutes')::INTERVAL)::TIME,
        ('08:00'::TIME + ((p.period * 50 + 40) || ' minutes')::INTERVAL)::TIME,
        'Room ' || (100 + (sps.subject_id * 7 + sps.class_id * 3 + sps.section_id * 5 + d.dow) % 200)
    FROM subjects_per_section sps
    CROSS JOIN (SELECT generate_series(1,5) AS dow) d
    CROSS JOIN (SELECT generate_series(0,5) AS period) p
    WHERE (p.period + d.dow) % sps.cnt = sps.rn
    ON CONFLICT DO NOTHING;
END $$;
