-- Create announcements table for platform-wide announcements
-- Admins can create announcements, students can view active ones

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'teachers', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_target ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_expires ON announcements(expires_at);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view active, non-expired announcements targeted to them
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

-- Trigger to update updated_at on row update
CREATE TRIGGER announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_announcements_updated_at();

-- Insert some sample announcements
INSERT INTO announcements (title, message, type, priority, target_audience, created_by) VALUES
    ('Welcome to Promax Education!', 'Platformamizga xush kelibsiz! Test sistemasidan foydalaning va bilimingizni sinab ko''ring.', 'success', 10, 'all', NULL),
    ('Weekly Mock Exam', 'Yakshanba kuni soat 10:00 da MOCK imtihoni bo''lib o''tadi. Ishtirok etishni unutmang!', 'warning', 5, 'students', NULL),
    ('New Study Materials', 'Yangi o''quv materiallari yuklab qo''yildi. Courses bo''limidan ko''ring.', 'info', 3, 'students', NULL);

-- Grant necessary permissions
GRANT SELECT ON announcements TO anon, authenticated;
GRANT ALL ON announcements TO service_role;
