-- FIXED VERSION: Idempotent migration that can be safely re-run
-- Run this version to complete the migration

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students view active announcements" ON announcements;
DROP POLICY IF EXISTS "Admins manage announcements" ON announcements;

-- Policy: Students can view active, non-expired announcements
CREATE POLICY "Students view active announcements"
    ON announcements FOR SELECT
    USING (
        is_active = true 
        AND (expires_at IS NULL OR expires_at > now())
        AND (
            target_audience = 'all' 
            OR target_audience = 'students'
            OR (
                target_audience = 'teachers' 
                AND EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('teacher', 'admin', 'staff')
                )
            )
        )
    );

-- Policy: Admins and staff can manage all announcements
CREATE POLICY "Admins manage announcements"
    ON announcements FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- Function to auto-update updated_at timestamp  
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS announcements_updated_at ON announcements;
CREATE TRIGGER announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_announcements_updated_at();

-- Insert sample data (only if not already present)
INSERT INTO announcements (title, message, type, priority, target_audience, created_by) 
SELECT 'Welcome to Promax Education!', 'Platformamizga xush kelibsiz! Test sistemasidan foydalaning va bilimingizni sinab ko''ring.', 'success', 10, 'all', NULL
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'Welcome to Promax Education!');

INSERT INTO announcements (title, message, type, priority, target_audience, created_by)
SELECT 'Weekly Mock Exam', 'Yakshanba kuni soat 10:00 da MOCK imtihoni bo''lib o''tadi. Ishtirok etishni unutmang!', 'warning', 5, 'students', NULL
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'Weekly Mock Exam');

INSERT INTO announcements (title, message, type, priority, target_audience, created_by)
SELECT 'New Study Materials', 'Yangi o''quv materiallari yuklab qo''yildi. Courses bo''limidan ko''ring.', 'info', 3, 'students', NULL
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'New Study Materials');
