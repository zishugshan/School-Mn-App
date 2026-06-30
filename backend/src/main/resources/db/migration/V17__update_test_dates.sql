-- Update test dates so upcoming tests appear in student dashboard
-- Spread ~2/3 of past tests across the next 14 days so the "Upcoming Tests" section shows data
UPDATE tests
SET test_date = CURRENT_DATE + ((id % 14 + 1)::integer)
WHERE test_date < CURRENT_DATE AND id % 3 != 0;