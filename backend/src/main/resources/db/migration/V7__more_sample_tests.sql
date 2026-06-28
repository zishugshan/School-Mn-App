-- Add sample tests for all classes (V2 only had tests for classes 6, 7, 8)
-- Class 1 (section 1=A, 2=B)
INSERT INTO tests (title, description, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published) VALUES
('Math Basics', 'Basic addition and subtraction', 1, 1, 1, 1, 50.00, 18.00, CURRENT_DATE - 20, 'QUIZ'::exam_type, true),
('English Alphabet', 'Alphabet recognition and phonics', 2, 1, 1, 2, 30.00, 10.00, CURRENT_DATE - 12, 'QUIZ'::exam_type, true),
('Science Fun', 'Basic science concepts', 3, 1, 1, 3, 40.00, 14.00, CURRENT_DATE - 5, 'QUIZ'::exam_type, true);

-- Class 2 (section 3=A, 4=B)
INSERT INTO tests (title, description, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published) VALUES
('Math Test', 'Multiplication and division', 1, 2, 3, 1, 60.00, 22.00, CURRENT_DATE - 18, 'QUIZ'::exam_type, true),
('Hindi Exam', 'Basic Hindi grammar', 5, 2, 3, 2, 50.00, 18.00, CURRENT_DATE - 8, 'MIDTERM'::exam_type, true);

-- Class 3 (section 5=A)
INSERT INTO tests (title, description, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published) VALUES
('Math Quiz', 'Fractions and decimals', 1, 3, 5, 1, 50.00, 18.00, CURRENT_DATE - 14, 'QUIZ'::exam_type, true),
('Science Test', 'Plants and animals', 3, 3, 5, 3, 60.00, 22.00, CURRENT_DATE - 7, 'MIDTERM'::exam_type, true),
('Social Studies', 'Our country', 4, 3, 5, 2, 40.00, 14.00, CURRENT_DATE - 3, 'QUIZ'::exam_type, true);

-- Class 4 (section 6=A)
INSERT INTO tests (title, description, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published) VALUES
('Math Exam', 'Geometry basics', 1, 4, 6, 1, 80.00, 28.00, CURRENT_DATE - 16, 'MIDTERM'::exam_type, true),
('English Grammar', 'Parts of speech', 2, 4, 6, 2, 50.00, 18.00, CURRENT_DATE - 9, 'QUIZ'::exam_type, true);

-- Class 5 (section 7=A)
INSERT INTO tests (title, description, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published) VALUES
('Math Test', 'Algebra basics', 1, 5, 7, 1, 70.00, 25.00, CURRENT_DATE - 11, 'MIDTERM'::exam_type, true),
('Science Quiz', 'Human body systems', 3, 5, 7, 3, 50.00, 18.00, CURRENT_DATE - 6, 'QUIZ'::exam_type, true),
('Computer Science', 'Introduction to computers', 6, 5, 7, 1, 40.00, 14.00, CURRENT_DATE - 2, 'QUIZ'::exam_type, false);

-- Class 6 already has: Math Mid-Term (MIDTERM, 100 marks), Math Weekly Quiz (QUIZ, 20 marks) from V2

-- Class 7 already has: English Quarterly (MIDTERM, 80 marks) from V2
-- Add one more for Class 7
INSERT INTO tests (title, description, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published) VALUES
('English Quiz', 'Vocabulary and comprehension', 2, 7, 9, 2, 40.00, 14.00, CURRENT_DATE + 5, 'QUIZ'::exam_type, false);

-- Class 8 already has: Physics Test (QUIZ, 50 marks) from V2
-- Add a Science test for Class 8
INSERT INTO tests (title, description, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published) VALUES
('Chemistry Basics', 'Elements and compounds', 8, 8, 10, 3, 60.00, 22.00, CURRENT_DATE - 3, 'QUIZ'::exam_type, true);

-- Class 9 (section 11=A)
INSERT INTO tests (title, description, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published) VALUES
('Math Exam', 'Quadratic equations', 1, 9, 11, 1, 100.00, 35.00, CURRENT_DATE - 13, 'MIDTERM'::exam_type, true),
('Physics Test', 'Laws of motion', 7, 9, 11, 3, 80.00, 28.00, CURRENT_DATE - 7, 'MIDTERM'::exam_type, true),
('Biology Quiz', 'Cell structure', 9, 9, 11, 3, 50.00, 18.00, CURRENT_DATE - 1, 'QUIZ'::exam_type, false);

-- Class 10 (section 12=A)
INSERT INTO tests (title, description, subject_id, class_id, section_id, teacher_id, maximum_marks, passing_marks, test_date, exam_type, is_published) VALUES
('Math Final', 'Calculus prep and statistics', 1, 10, 12, 1, 100.00, 35.00, CURRENT_DATE - 10, 'FINAL'::exam_type, true),
('Chemistry Exam', 'Chemical reactions', 8, 10, 12, 3, 80.00, 28.00, CURRENT_DATE - 5, 'MIDTERM'::exam_type, true),
('English Final', 'Literature and grammar', 2, 10, 12, 2, 90.00, 32.00, CURRENT_DATE + 10, 'FINAL'::exam_type, false);
