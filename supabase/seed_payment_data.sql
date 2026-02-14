-- Sample data for testing payment system

-- Insert sample courses for existing students
DO $$
DECLARE
    student_id UUID;
BEGIN
    -- Get first student ID (replace with actual student ID from your database)
    SELECT id INTO student_id FROM profiles WHERE role = 'student' LIMIT 1;
    
    IF student_id IS NOT NULL THEN
        -- Enroll student in Matematika
        INSERT INTO student_courses (student_id, subject, monthly_fee, start_date, status)
        VALUES (student_id, 'matematika', 500000, '2026-02-01', 'active');
        
        -- Enroll same student in Ingliz tili
        INSERT INTO student_courses (student_id, subject, monthly_fee, start_date, status)
        VALUES (student_id, 'ingliz_tili', 400000, '2026-02-01', 'active');
        
        RAISE NOTICE 'Sample courses created for student %', student_id;
    ELSE
        RAISE NOTICE 'No student found. Please create a student first.';
    END IF;
END $$;

-- The monthly_payment_status will be automatically created by the trigger
