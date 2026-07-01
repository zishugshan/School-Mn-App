-- Create exam schedules (Mid-Term + Final) and homework assignments
DO $$
DECLARE
    hw_id BIGINT;
    cid INT;
    cname VARCHAR;
    subj_name VARCHAR;
    subj_id INT;
    tid INT;
BEGIN
    IF (SELECT COUNT(*) > 10 FROM exam_schedules) THEN
        RAISE NOTICE 'Exam schedules exist, skipping V24';
        RETURN;
    END IF;

    INSERT INTO exam_schedules (title, class_id, subject_id, exam_type, date, start_time, end_time, room_number)
    SELECT 'Mid-Term - ' || s.name, c.id, s.id, 'MIDTERM', CURRENT_DATE + INTERVAL '75 days', '09:00:00', '12:00:00', 'Room ' || (100 + (s.id * 7 + c.id * 3) % 200)
    FROM classes c
    JOIN subjects s ON s.id IN (SELECT subject_id FROM class_subject WHERE class_id = c.id);

    INSERT INTO exam_schedules (title, class_id, subject_id, exam_type, date, start_time, end_time, room_number)
    SELECT 'Final - ' || s.name, c.id, s.id, 'FINAL', CURRENT_DATE + INTERVAL '160 days', '09:00:00', '12:00:00', 'Room ' || (150 + (s.id * 11 + c.id * 5) % 200)
    FROM classes c
    JOIN subjects s ON s.id IN (SELECT subject_id FROM class_subject WHERE class_id = c.id);

    FOR cid IN (SELECT id FROM classes ORDER BY id) LOOP
        SELECT name INTO cname FROM classes WHERE id = cid;
        FOREACH subj_name IN ARRAY ARRAY['Mathematics', 'English'] LOOP
            SELECT id INTO subj_id FROM subjects WHERE name = subj_name;
            CONTINUE WHEN subj_id IS NULL;
            SELECT ts.teacher_id INTO tid FROM teacher_subject ts WHERE ts.subject_id = subj_id LIMIT 1;
            CONTINUE WHEN tid IS NULL;
            INSERT INTO homework (title, description, subject_id, teacher_id, due_date, max_score)
            VALUES (subj_name || ' Homework - ' || cname,
                    'Complete the ' || subj_name || ' assignment. Submit by due date.',
                    subj_id, tid, CURRENT_DATE + INTERVAL '7 days', 50)
            RETURNING id INTO hw_id;
            INSERT INTO homework_target (homework_id, class_id, section_id)
            SELECT hw_id, cid, id FROM sections WHERE class_id = cid;
        END LOOP;
    END LOOP;
END $$;
